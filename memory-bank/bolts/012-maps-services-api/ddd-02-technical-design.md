---
unit: 001-maps-services-api
bolt: 012-maps-services-api
stage: design
status: complete
created: 2026-06-08T23:55:00Z
---

# Technical Design - Chat Location Intent & Map Action

## Architecture Pattern

**Extensão hexagonal do módulo `conversations`** — detecção de intenção geográfica e emissão de `map_action` como metadado da mensagem assistant, **sem novo endpoint** e **sem chamadas OSM** no fluxo de chat.
 
**Rationale**:

- Reutiliza `POST /api/v1/conversations/:id/messages` e `SendMessageUseCase` existentes (bolts 004/005).
- `map_action` representa **somente a intenção de handoff** para o app abrir/executar busca no `MapsModule`; a busca real (`SearchPoisUseCase`, Google Maps Platform) permanece exclusivamente no bolt 011.
- Orquestração LLM estendida via tool `search_nearby_place` — estrutura parâmetros, não executa busca.
- VOs `PoiCategory` e `SearchRadius` compartilhados via import de tipos do módulo `maps` (sem injetar use cases maps no chat).

**Decisões explícitas (aprovadas)**:

| Decisão | Implementação |
|---------|---------------|
| Sem endpoint dedicado | Estender `SendMessageUseCase` + resposta `MessageDto` |
| Metadado na mensagem assistant | Campo Prisma `metadata Json?` → API `metadata.map_action` |
| Sem execução de busca no chat | `SendMessageUseCase` **não** importa/injeta gateways OSM nem `SearchPoisUseCase` |
| Ambiguidade "saúde" | Clarificação UBS (`health_post`) vs hospital/UPA (`hospital`) antes de emitir `map_action` |
| Raio permitido | Apenas `2`, `5` ou `10` km; default `5` |
| "bem perto" | `radiusKm: 2` |
| "perto de mim" | `radiusKm: 5` |
| "mais longe" / expansão | `radiusKm: 10` |

---

## Layer Structure

```text
apps/backend/src/modules/conversations/
├── domain/
│   ├── value-objects/
│   │   ├── map-action.vo.ts              # NEW — valida payload handoff
│   │   └── location-context-hints.vo.ts  # NEW — hints para raio
│   ├── services/
│   │   ├── category-disambiguator.service.ts   # NEW
│   │   ├── radius-suggestion.policy.ts         # NEW
│   │   └── map-action-builder.service.ts       # NEW
│   └── errors/
│       └── domain.errors.ts              # + InvalidMapActionError
├── application/
│   ├── ports/
│   │   └── assistant-reply.generator.ts  # EXTEND — retorno com mapAction?
│   └── use-cases/
│       └── send-message.use-case.ts      # EXTEND — persiste metadata
├── infrastructure/
│   └── assistant/
│       ├── gemini-assistant-reply.generator.ts  # EXTEND — tool + policies
│       ├── location-intent.prompt.ts            # NEW — instruções PT-BR
│       └── tools/
│           └── search-nearby-place.tool.ts      # NEW — schema Gemini function
├── presentation/
│   ├── dto/
│   │   └── message.dto.ts                # EXTEND — metadata.map_action
│   └── mappers/
│       └── conversation.mapper.ts        # EXTEND — serializa map_action
└── conversations.module.ts               # SEM import MapsModule

apps/backend/src/modules/maps/
└── domain/value-objects/
    ├── poi-category.vo.ts                # REUSE — exportado/compartilhado
    └── search-radius.vo.ts               # REUSE — exportado/compartilhado
```

**Fronteira crítica**: `ConversationsModule` **não** importa `MapsModule`. Compartilhamento limitado a VOs/enums em `maps/domain` (import de tipos puros, zero DI de use cases).

---

## API Design

**Nenhum endpoint novo.** Contrato estendido do endpoint existente:

| Endpoint | Method | Auth | Request | Response `data` |
|----------|--------|------|---------|-----------------|
| `/api/v1/conversations/:id/messages` | POST | Firebase | `{ "content": string }` | `MessageDto` (assistant) |

### MessageDto (estendido)

```json
{
  "id": "cuid",
  "role": "assistant",
  "content": "Vou procurar farmácias em um raio de 5 km perto de você.",
  "metadata": {
    "map_action": {
      "type": "map_search",
      "category": "pharmacy",
      "radiusKm": 5,
      "center": null
    }
  },
  "createdAt": "2026-06-08T18:01:00.000Z"
}
```

### Convenção de nomenclatura JSON

| Camada | Nomenclatura | Exemplo |
|--------|--------------|---------|
| **API JSON** (specs/stories) | `metadata.map_action` (snake_case) | Campo no envelope HTTP |
| **TypeScript domínio** | `MapAction`, propriedade `mapAction` | VO interno |
| **Prisma `metadata` JSON** | `map_action` (snake_case) | Persistência alinhada à API |
| **Flutter** | `mapAction` (camelCase Dart) | Parse de `metadata['map_action']` |

> Stories 003/007 e `system-context.md` usam `map_action`. Campos internos do payload seguem camelCase já adotado (`radiusKm`, `category`) conforme story 003 e bolt 011.

### map_action schema

```typescript
interface MapActionPayload {
  type: 'map_search';           // fixo no MVP
  category: PoiCategory;          // enum 6 categorias MVP
  radiusKm: 2 | 5 | 10;          // default 5
  center?: { lat: number; lon: number } | null;  // omitido/null → app usa GPS
}
```

**Quando `metadata` está ausente ou `map_action` é `null`**: fluxo normal de chat (ex.: "como fazer PIX").

**Quando clarificação pendente** (ex.: "preciso de saúde perto"): `metadata.map_action` **ausente**; `content` contém pergunta de desambiguação.

### Exemplos de resposta

**Intenção clara — farmácia**:

```json
{
  "data": {
    "id": "msg_abc",
    "role": "assistant",
    "content": "Entendi! Vou procurar a farmácia mais próxima em um raio de 5 km.",
    "metadata": {
      "map_action": {
        "type": "map_search",
        "category": "pharmacy",
        "radiusKm": 5
      }
    },
    "createdAt": "2026-06-08T18:01:00.000Z"
  },
  "meta": { "requestId": "uuid" }
}
```

**Ambiguidade — saúde (sem map_action)**:

```json
{
  "data": {
    "id": "msg_def",
    "role": "assistant",
    "content": "Você precisa de um posto de saúde (UBS) ou de um hospital/UPA?",
    "metadata": null,
    "createdAt": "2026-06-08T18:02:00.000Z"
  },
  "meta": { "requestId": "uuid" }
}
```

**Não geográfico — PIX (sem map_action)**:

```json
{
  "data": {
    "id": "msg_ghi",
    "role": "assistant",
    "content": "Para fazer um PIX, você precisa abrir o app do seu banco...",
    "metadata": null,
    "createdAt": "2026-06-08T18:03:00.000Z"
  },
  "meta": { "requestId": "uuid" }
}
```

Envelope, erros e auth inalterados (`api-conventions.md`).

---

## Fluxo SendMessage (estendido)

```text
POST /conversations/:id/messages
       │
       ▼
SendMessageUseCase.execute(firebaseUid, conversationId, content)
       │
       ├─► Ownership + status check (existente)
       │
       ├─► AssistantReplyGenerator.generateReply({ ... })
       │         │
       │         ├─► SensitiveContentPolicy (existente)
       │         │
       │         ├─► KnowledgeRetriever + RAG (existente)
       │         │
       │         ├─► Location intent branch (NOVO)
       │         │         │
       │         │         ├─ LLM com tool search_nearby_place
       │         │         │     (function calling — NÃO executa busca)
       │         │         │
       │         │         ├─ CategoryDisambiguator
       │         │         │     "saúde" → pergunta UBS vs hospital
       │         │         │     múltiplas categorias → pedir escolha
       │         │         │
       │         │         ├─ RadiusSuggestionPolicy
       │         │         │     default 5 | "bem perto"→2 | "perto de mim"→5 | "mais longe"→10
       │         │         │
       │         │         └─ MapActionBuilder → MapAction VO
       │         │               (somente se categoria resolvida)
       │         │
       │         └─► Retorna { content, nextCurrentStep, mapAction? }
       │
       ├─► Persiste Message(user) + Message(assistant, metadata)
       │
       └─► ConversationMapper → MessageDto com metadata.map_action
```

**Proibições no fluxo**:

- ❌ Chamar `SearchPoisUseCase`, `GeocodePlaceUseCase`, `GetStaticRouteUseCase`
- ❌ HTTP para Google Maps Platform
- ❌ Importar `MapsModule` no `ConversationsModule`

**Handoff mobile** (bolt 015): app lê `metadata.map_action` → navega para Mapas → chama `POST /api/v1/maps/search` com `category`, `radiusKm`, `lat/lon` (GPS).

---

## LLM Tool: search_nearby_place

Registrada no `GeminiAssistantReplyGenerator` via function calling.

### Schema (Gemini function declaration)

```json
{
  "name": "search_nearby_place",
  "description": "Estrutura intenção de busca de lugar próximo. NÃO executa busca — apenas prepara handoff para o app.",
  "parameters": {
    "type": "object",
    "properties": {
      "category": {
        "type": "string",
        "enum": ["pharmacy", "health_post", "hospital", "bank", "post_office", "supermarket"]
      },
      "radiusKm": {
        "type": "integer",
        "enum": [2, 5, 10],
        "description": "Raio em km. Default 5. Use 2 para 'bem perto', 5 para 'perto de mim', 10 para 'mais longe'."
      },
      "isAmbiguousHealth": {
        "type": "boolean",
        "description": "true se usuário disse 'saúde' sem especificar UBS ou hospital"
      },
      "isGeographicIntent": {
        "type": "boolean",
        "description": "false se mensagem não é sobre busca de lugar físico"
      }
    },
    "required": ["isGeographicIntent"]
  }
}
```

### Comportamento do orquestrador pós-tool-call

| Condição | Ação |
|----------|------|
| `isGeographicIntent === false` | Ignorar tool; resposta RAG normal; `map_action` ausente |
| `isAmbiguousHealth === true` | Gerar pergunta UBS vs hospital; **sem** `map_action` |
| Categoria explícita + resolvida | `RadiusSuggestionPolicy` + `MapActionBuilder` → emitir `map_action` |
| `radiusKm` inválido ou ausente | Normalizar para `5` via `SearchRadius` VO |
| Tool não invocada | Heurística leve em `TopicInferencePolicy` não aplica maps; LLM decide via prompt |

---

## Domain Services (implementação)

### CategoryDisambiguator

```typescript
// Entrada: termos detectados pelo LLM ou heurística PT-BR
// Saída: PoiCategory | ClarificationRequired

const HEALTH_AMBIGUOUS = ['saúde', 'saude', 'posto de saúde', 'unidade de saúde'];

// Clarificação padrão:
// "Você precisa de um posto de saúde (UBS) ou de um hospital/UPA?"
// options: [health_post, hospital]
```

### RadiusSuggestionPolicy

| Gatilho (PT-BR) | `radiusKm` |
|-----------------|------------|
| Default / sem indicação / "perto de mim" | `5` |
| "bem perto", "pertinho", "só pertinho", "bem aqui perto" | `2` |
| "mais longe", "amplia", "aumenta", "região maior" | `10` |
| Contexto urbano denso (hint LLM) | `2` (se usuário não contradisse) |
| Contexto rural (hint LLM) | `10` (se usuário não contradisse) |

Validação final via `SearchRadius.create(km)` — rejeita valores fora de `[2, 5, 10]`.

### MapActionBuilder

```typescript
build(input: {
  category: PoiCategory;
  radiusKm: SearchRadius;
  center?: GeoPoint | null;
}): Result<MapAction, DomainError>

// Output JSON-ready:
// { type: 'map_search', category, radiusKm, center? }
```

---

## Data Persistence

### Prisma migration (adição)

```prisma
model Message {
  id             String      @id @default(cuid())
  conversationId String      @map("conversation_id")
  role           MessageRole
  content        String      @db.VarChar(4000)
  metadata       Json?       // NEW — map_action e extensões futuras
  createdAt      DateTime    @default(now()) @map("created_at")
  conversation   Conversation @relation(...)

  @@index([conversationId, createdAt(sort: Asc)])
  @@map("messages")
}
```

### Formato `metadata` persistido

```json
{
  "map_action": {
    "type": "map_search",
    "category": "pharmacy",
    "radiusKm": 5
  }
}
```

| Campo | Storage | Retention |
|-------|---------|-----------|
| `messages.metadata` | PostgreSQL JSON | Permanente (histórico chat) |
| Estado clarificação | Implícito no histórico (pergunta assistant sem map_action) | — |

Migration: `pnpm prisma migrate dev --name add_message_metadata`

### Transação SendMessage (atualizada)

```text
BEGIN
  SELECT conversation FOR UPDATE ...
  INSERT message (user, content)
  INSERT message (assistant, content, metadata)  -- metadata.map_action se aplicável
  UPDATE conversation SET current_step = :next, updated_at = NOW()
COMMIT
```

---

## Port Extension: AssistantReplyGenerator

```typescript
// application/ports/assistant-reply.generator.ts

export interface AssistantReply {
  content: string;
  nextCurrentStep: number;
  mapAction?: MapAction;  // NEW — undefined quando ausente
}

export interface AssistantReplyGenerator {
  generateReply(input: GenerateReplyInput): Promise<AssistantReply>;
}
```

`SendMessageUseCase` serializa `mapAction` → `metadata: { map_action: ... }` antes do persist.

---

## Security Design

| Concern | Approach |
|---------|----------|
| **Authentication** | Inalterado — Firebase guard em `/conversations/*` |
| **map_action injection** | Cliente **não** envia `metadata`; somente server gera na mensagem assistant |
| **Privacidade** | Prompt proíbe pedir endereço completo; `center` opcional; preferir GPS do app |
| **Guardrails** | `SensitiveContentPolicy` existente antes e depois da geração LLM |
| **Validação server-side** | `MapAction` VO revalida category/radius mesmo após tool call LLM |
| **Logging** | Logar `map_action.category` + `radiusKm` + `requestId`; não logar coordenadas precisas em prod |

---

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| **Latência chat (p95 < 8s)** | Tool call adiciona ~1 round-trip LLM; manter histórico limitado (10 msgs) |
| **Consistência specs** | JSON `metadata.map_action`; Flutter parseia snake_case na borda |
| **Degradação** | Se LLM falha tool call → resposta textual sem `map_action` (não bloqueia chat) |
| **Swagger** | Atualizar `@ApiProperty` em `MessageDto` com `metadata` opcional |

---

## Error Handling

| Cenário | HTTP | Comportamento |
|---------|------|---------------|
| `MapAction` inválido pós-LLM | — (interno) | Não emitir `map_action`; log warn; resposta textual |
| Categoria ambígua | 200 | Clarificação em `content`; `metadata` null |
| Mensagem não geográfica | 200 | RAG normal; `metadata` null |
| LLM timeout | 503/500 | Erro existente do generator |
| Validação `content` vazio | 400 | Inalterado |

Sem novos códigos HTTP — extensão transparente ao contrato existente.

---

## Module Wiring

```text
ConversationsModule
├── imports: [KnowledgeBaseModule, PrismaModule, ...]  # SEM MapsModule
├── providers:
│   ├── SendMessageUseCase                    # EXTEND
│   ├── GeminiAssistantReplyGenerator         # EXTEND + tool
│   ├── CategoryDisambiguator                 # NEW
│   ├── RadiusSuggestionPolicy                # NEW
│   ├── MapActionBuilder                      # NEW
│   └── SearchNearbyPlaceToolDefinition       # NEW
└── exports: (inalterado)

MapsModule (bolt 011 — inalterado neste bolt)
├── SearchPoisUseCase, GeocodePlaceUseCase, GetStaticRouteUseCase
└── Gateways Google Maps (Places/Geocoding/Directions)
    ↑ consumido pelo Flutter via REST, NÃO pelo SendMessageUseCase
```

**Shared types** (opcional, evitar acoplamento circular):

```text
apps/backend/src/shared/maps/
├── poi-category.enum.ts      # ou re-export de maps/domain
└── search-radius.constants.ts
```

Alternativa preferida: import direto de `maps/domain/value-objects/*.vo.ts` (classes puras, sem Nest providers).

---

## Prompt Extensions

Arquivo `location-intent.prompt.ts` — fragmento injetado no system prompt quando conversa pode envolver mapas:

```text
REGRAS DE INTENÇÃO GEOGRÁFICA:
- Se o usuário busca um lugar físico próximo (farmácia, banco, etc.), use a tool search_nearby_place.
- Se disser "saúde" sem especificar, NÃO emita busca — pergunte: UBS/posto de saúde ou hospital/UPA?
- Raio: default 5 km; "bem perto" = 2 km; "perto de mim" = 5 km; "mais longe" = 10 km.
- Nunca peça endereço completo ou dados sensíveis.
- Para dúvidas não geográficas (PIX, WhatsApp, etc.), NÃO use a tool.
- A tool NÃO executa busca — apenas prepara o app para abrir o mapa.
```

---

## Test Strategy

| Tipo | Alvo | Abordagem |
|------|------|-----------|
| **Unit** | `MapAction` VO | Valida category, radius 2/5/10, type fixo |
| **Unit** | `RadiusSuggestionPolicy` | "bem perto"→2, "perto de mim"→5, "mais longe"→10, default 5 |
| **Unit** | `CategoryDisambiguator` | "saúde"→clarify; "farmácia"→pharmacy |
| **Unit** | `MapActionBuilder` | Payload correto; center opcional |
| **Unit** | `GeminiAssistantReplyGenerator` | Mock LLM: tool call → mapAction; ambíguo → sem action; PIX → sem action |
| **Unit** | `SendMessageUseCase` | Mock generator; verifica metadata persistido |
| **Unit** | `ConversationMapper` | JSON `metadata.map_action` snake_case |
| **Integration** | POST messages | Mock Gemini; assert envelope com/sem map_action |

**Não testar** integração SendMessage → MapsModule (não existe por design).

---

## Stories Mapping

| Story | Entregável |
|-------|------------|
| **003-location-intent-chat** | Tool LLM, `CategoryDisambiguator`, `metadata.map_action` condicional, clarificação saúde, guardrails |
| **004-radius-suggestion-response** | `RadiusSuggestionPolicy`, default 5 km, regras 2/5/10, texto PT explicativo no `content` |

---

## Implementation Notes

1. **Ordem de implementação**: migration metadata → VOs → policies → tool → generator → use case → mapper/DTO.
2. **Retrocompatibilidade**: mensagens antigas têm `metadata: null`; Flutter trata ausência como chat normal.
3. **GET conversation**: mensagens históricas incluem `metadata.map_action` quando presente (mapper estendido).
4. **Clarificação multi-turn**: turno seguinte com resposta "UBS" → LLM resolve `health_post` → emite `map_action`.
5. **Center omitido no MVP**: app mobile obtém GPS; geocode de bairro fica para bolt UI 015 se necessário via `/maps/geocode`.
6. **Export bolt 011**: remover menção a `MapsModule` exports para chat — handoff é REST-only pelo mobile.

---

## Diagrama de sequência (handoff completo)

```text
Usuário          Flutter           Conversations API        Maps API
   │                │                      │                      │
   │ "farmácia      │ POST /messages       │                      │
   │  mais próxima" │─────────────────────►│                      │
   │                │                      │ LLM + tool           │
   │                │                      │ (sem OSM)            │
   │                │◄─────────────────────│                      │
   │                │ metadata.map_action  │                      │
   │ confirma       │                      │                      │
   │                │ navega /maps         │                      │
   │                │ POST /maps/search    │                      │
   │                │─────────────────────────────────────────────►│
   │                │                      │         SearchPoisUseCase
   │                │◄─────────────────────────────────────────────│
   │ vê resultados  │ POI[]                │                      │
```
