---
unit: 001-maps-services-api
bolt: 012-maps-services-api
stage: model
status: complete
created: 2026-06-08T23:45:00Z
---

# Static Model - Chat Location Intent & Map Action

## Bounded Context

**Maps Services — Chat Location Intent** — extensão do módulo de conversas que detecta intenções geográficas em mensagens de chat, produz respostas em português simples e emite payload estruturado `map_action` para handoff ao app mobile.

**Fronteiras**:

- **Dentro**: classificação de intenção geográfica vs. não geográfica, resolução de categoria POI ambígua, sugestão de raio (2/5/10 km), construção do VO `MapAction`, tool LLM `search_nearby_place`, guardrails de privacidade (sem endereço completo sensível).
- **Fora**: execução da busca POI (`SearchPoisUseCase` — bolt 011), renderização de mapa (Flutter), permissão GPS no dispositivo, UI de handoff chat→mapas (bolt 015), persistência de histórico de buscas.

**Relação com bolt 011**: reutiliza VOs `PoiCategory`, `SearchRadius`, `GeoPoint` do contexto OSM Proxy; este bolt adiciona a camada de **orquestração conversacional** que traduz linguagem natural em parâmetros de busca.

---

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **AssistantReply** | `text: string`, `mapAction?: MapAction`, `clarificationNeeded?: ClarificationPrompt` | `text` sempre em português simples; `mapAction` presente **somente** quando intenção geográfica confirmada e categoria resolvida; mutuamente exclusivo com `clarificationNeeded` em estado pendente |
| **ClarificationPrompt** | `question: string`, `options: PoiCategory[]`, `reason: ClarificationReason` | Disparado quando categoria ambígua (ex.: "saúde" → UBS vs hospital); IA não emite `mapAction` até usuário escolher |
| **LocationIntent** | `isGeographic: boolean`, `resolvedCategory?: PoiCategory`, `confidence: IntentConfidence`, `contextHints: LocationContextHints` | `isGeographic=false` → fluxo RAG normal, sem tool maps; `confidence=low` → preferir clarificação antes de `mapAction` |

> **Nota**: `AssistantReply` é um read model da resposta do assistente — não persistido separadamente; `Message` existente (unit 003-ai-assistant-api) ganha campo opcional `metadata.mapAction`.

---

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **MapAction** | `type: "map_search"`, `category: PoiCategory`, `radiusKm: SearchRadius`, `center?: GeoPoint` | `type` fixo `"map_search"` no MVP; `radiusKm` default `5`; `center` opcional (app usa GPS quando omitido); serializável JSON para o mobile |
| **SearchRadius** | `kilometers: 2 \| 5 \| 10` | Reutilizado do bolt 011; default `5`; únicos valores permitidos no `mapAction` |
| **PoiCategory** | `value: enum` | Reutilizado do bolt 011: `pharmacy`, `health_post`, `hospital`, `bank`, `post_office`, `supermarket` |
| **GeoPoint** | `lat: number`, `lon: number` | Reutilizado do bolt 011; preenchido quando usuário informa bairro/cidade (via geocode interno) ou omitido para GPS do app |
| **IntentConfidence** | `level: "high" \| "medium" \| "low"` | `high`: categoria explícita ("farmácia"); `medium`: inferida por contexto; `low`: ambígua → clarificação |
| **LocationContextHints** | `isUrbanDense?: boolean`, `isRural?: boolean`, `userRequestedWider?: boolean`, `userRequestedNarrower?: boolean` | Alimenta regras de sugestão de raio (story 004) |
| **RadiusSuggestion** | `suggestedKm: SearchRadius`, `explanation: string` | `explanation` em linguagem simples ("vou procurar em um raio de 5 km"); valores 2/5/10 apenas |
| **ClarificationReason** | `code: enum` | `ambiguous_category`, `multiple_categories`, `missing_location_context` |
| **UserMessage** | `text: string`, `conversationId: string` | Trim; passa por guardrails existentes antes da detecção de intenção |

---

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| **LocationIntentResolution** | `LocationIntent`, `RadiusSuggestion?`, `MapAction?`, `ClarificationPrompt?` | Exatamente um estado terminal por turno: (a) clarificação pendente, (b) `mapAction` emitido, ou (c) fluxo normal sem maps; nunca `mapAction` + `clarificationNeeded` simultâneos |
| **MapActionPayload** | `MapAction`, `RadiusSuggestion` | `MapAction.radiusKm` deve igualar `RadiusSuggestion.suggestedKm` quando ambos presentes; default 5 km se usuário não especificou distância |

---

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| **LocationIntentDetected** | LLM classifica mensagem como geográfica | `{ conversationId, category?, confidence }` |
| **MapActionEmitted** | Resposta final inclui handoff para mapas | `{ conversationId, mapAction: MapAction }` |
| **RadiusSuggested** | IA propõe raio antes/durante confirmação | `{ conversationId, radiusKm, explanation }` |
| **CategoryClarificationRequested** | Categoria ambígua detectada | `{ conversationId, options: PoiCategory[], question }` |

> Eventos são informativos para logging/observabilidade; não há event bus no MVP — emitidos como logs estruturados (Pino).

---

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| **LocationIntentClassifier** | `classify(message: UserMessage): LocationIntent` | Heurísticas + resultado do LLM (tool call ou structured output) |
| **CategoryDisambiguator** | `resolveAmbiguity(intent: LocationIntent): ClarificationPrompt \| PoiCategory` | Mapeamento semântico "saúde" → `[health_post, hospital]`; regra: múltiplas categorias na frase → pedir escolha |
| **RadiusSuggestionPolicy** | `suggest(hints: LocationContextHints): RadiusSuggestion` | Default 5 km; 2 km se urbano denso ou "só pertinho"; 10 km se rural/"mais longe"/poucos resultados esperados |
| **MapActionBuilder** | `build(category: PoiCategory, radius: SearchRadius, center?: GeoPoint): MapAction` | Valida categoria e raio; monta payload `{ type, category, radiusKm, center? }` |
| **GeographicIntentGuard** | `shouldEmitMapAction(intent: LocationIntent): boolean` | Retorna `false` para mensagens não geográficas ("como fazer PIX"); retorna `false` se clarificação pendente |

### Regras RadiusSuggestionPolicy (story 004)

| Condição | Raio sugerido | Exemplo de explicação |
|----------|---------------|----------------------|
| Default (sem indicação) | 5 km | "Vou procurar em um raio de 5 km ao redor de você." |
| `isUrbanDense` ou `userRequestedNarrower` | 2 km | "Como você está numa área movimentada, vou procurar bem pertinho — cerca de 2 km." |
| `isRural` ou `userRequestedWider` | 10 km | "Na sua região, vou ampliar a busca para cerca de 10 km." |
| Usuário confirma no checkpoint | valor escolhido | Checkpoint existente do fluxo de conversas confirma antes da busca |

### Mapeamento semântico categoria (ambiguidade)

| Termo do usuário | Categorias candidatas | Comportamento |
|------------------|----------------------|---------------|
| "saúde", "posto de saúde" | `health_post`, `hospital` | Clarificação: "Você precisa de um posto de saúde (UBS) ou de um hospital?" |
| "farmácia", "remédio" | `pharmacy` | Resolução direta (high confidence) |
| "banco", "caixa" | `bank` | Resolução direta |
| "supermercado", "mercado" | `supermarket` | Resolução direta |
| "correios", "agência dos correios" | `post_office` | Resolução direta |
| "farmácia e supermercado" | múltiplas | Clarificação: pedir para escolher uma |

---

## Repository Interfaces (Ports)

| Repository | Entity / Retorno | Methods |
|------------|------------------|---------|
| **LlmProvider** *(existente)* | `AssistantReply` | `generateWithTools(context, tools): Promise<LlmResponse>` — estender com tool `search_nearby_place` |
| **MapsSearchPort** *(novo, adapter interno)* | `PoiSearchResult` | `searchNearby(category, radiusKm, center?): Promise<PoiSearchResult>` — delega a `SearchPoisUseCase` (bolt 011) |
| **GeocodePort** *(existente via maps)* | `GeoPoint` | `geocodePlace(query: PlaceQuery): Promise<GeoPoint \| null>` — quando usuário informa bairro/cidade |
| **ConversationRepository** *(existente)* | `Message` | `appendMessage(conversationId, message): Promise<Message>` — persiste `metadata.mapAction` na mensagem assistant |

### Tool LLM: `search_nearby_place`

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `category` | `PoiCategory` | sim | Categoria MVP |
| `radiusKm` | `2 \| 5 \| 10` | não (default 5) | Raio de busca |
| `centerLat` | `number` | não | Latitude se usuário informou local |
| `centerLon` | `number` | não | Longitude se usuário informou local |

**Comportamento**: tool disponível apenas quando intenção geográfica detectada; LLM preenche parâmetros; orquestrador valida e constrói `MapAction` — **não executa busca POI** neste turno (handoff para o app).

---

## Application Use Cases

| Use Case | Input | Output | Regras |
|----------|-------|--------|--------|
| **DetectLocationIntentUseCase** | `UserMessage` | `Result<LocationIntent, DomainError>` | Pré-filtro: mensagens claramente não geográficas → `isGeographic=false` sem chamar tool |
| **BuildMapActionUseCase** | `LocationIntent`, `LocationContextHints`, `GeoPoint?` | `Result<MapActionPayload, DomainError>` | Aplica `RadiusSuggestionPolicy` + `MapActionBuilder`; falha se categoria não resolvida |
| **SendMessageWithMapsUseCase** *(extensão de SendMessage)* | `conversationId`, `text` | `Result<AssistantReply, DomainError>` | Orquestra: guardrails → RAG → intent detection → (clarify \| map_action \| resposta normal) |
| **ResolveClarificationUseCase** | `conversationId`, `selectedCategory: PoiCategory` | `Result<MapActionPayload, DomainError>` | Continuação após clarificação; emite `mapAction` no próximo turno |

---

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **Intenção geográfica** | Mensagem do usuário que expressa desejo de encontrar um lugar físico próximo |
| **map_action** | Payload JSON estruturado anexado à resposta do assistente para o app abrir a tela de mapas |
| **Handoff chat→mapas** | Transição em que o mobile consome `map_action` e executa busca via `/maps/search` |
| **Clarificação de categoria** | Pergunta da IA quando termo do usuário mapeia para mais de uma categoria POI |
| **Raio de busca** | Distância em km (2, 5 ou 10) sugerida pela IA e enviada no `map_action` |
| **Checkpoint de confirmação** | Fluxo existente onde IA confirma com usuário antes de ação irreversível |
| **Tool search_nearby_place** | Função exposta ao LLM para estruturar parâmetros de busca geográfica |

---

## Stories Coverage

| Story | Cobertura no modelo |
|-------|---------------------|
| **003-location-intent-chat** | `LocationIntent`, `MapAction`, `ClarificationPrompt`, `GeographicIntentGuard`, tool `search_nearby_place`, use case `SendMessageWithMapsUseCase`; regra: não geográfico → sem `mapAction` |
| **004-radius-suggestion-response** | `RadiusSuggestion`, `RadiusSuggestionPolicy`, `LocationContextHints`; default 5 km; 2 km urbano/"pertinho"; 10 km rural/"mais longe"; campo `radiusKm` no `MapAction` |

---

## Diagrama (fluxo de detecção no chat)

```text
POST /conversations/:id/messages
       │
       ▼
SendMessageWithMapsUseCase
       │
       ├─► Guardrails (existente)
       │
       ├─► LocationIntentClassifier.classify(message)
       │         │
       │         ├─ isGeographic=false ──► RAG normal (sem map_action)
       │         │
       │         └─ isGeographic=true
       │                   │
       │                   ├─► CategoryDisambiguator
       │                   │         │
       │                   │         ├─ ambíguo ──► ClarificationPrompt (sem map_action)
       │                   │         │
       │                   │         └─ resolvido ──► continua
       │                   │
       │                   ├─► RadiusSuggestionPolicy.suggest(hints)
       │                   │
       │                   ├─► MapActionBuilder.build(...)
       │                   │
       │                   └─► AssistantReply { text PT, mapAction }
       │
       └─► ConversationRepository.appendMessage (metadata.mapAction)
```

## Diagrama (estados LocationIntentResolution)

```text
                    ┌─────────────────┐
                    │  Mensagem user  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        Não geográfico   Ambíguo      Geográfico claro
              │              │              │
              ▼              ▼              ▼
        Resposta RAG    Clarificação   RadiusSuggestion
        (sem action)    (sem action)        │
                                            ▼
                                      MapAction emitido
                                      (handoff mobile)
```

---

## Decisões de fronteira (referência ADRs bolt 011)

- **ADR-001**: endpoints `/maps/*` públicos — handoff mobile pode buscar POIs sem auth adicional no MVP.
- **ADR-003**: stack OSM pública — `MapsSearchPort` delega ao módulo maps já implementado.
- **Privacidade**: `GeographicIntentGuard` + guardrails existentes — nunca solicitar endereço completo; preferir GPS do app ou bairro/cidade genérico.
