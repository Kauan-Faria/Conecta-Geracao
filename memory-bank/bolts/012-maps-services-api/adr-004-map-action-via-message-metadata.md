---
bolt: 012-maps-services-api
created: 2026-06-09T00:05:00Z
status: accepted
---

# ADR-004: Handoff de mapas via metadata.map_action na mensagem assistant

## Context

O chat do app (`POST /api/v1/conversations/:id/messages`) retorna uma mensagem assistant com texto em português simples. A story `003-location-intent-chat` exige que, para intenções geográficas, a resposta inclua um payload estruturado (`map_action`) para o app mobile abrir a aba Mapas com categoria e raio pré-preenchidos.

Alternativas incluem: endpoint dedicado de handoff, campo top-level na resposta, ou embedding do JSON no `content` da mensagem. As specs (`system-context.md`, stories 003/007) referenciam `map_action` como contrato entre chat e UI.

## Decision

Anexar o payload de handoff em **`metadata.map_action`** na mensagem assistant persistida e retornada pelo endpoint existente de chat. Não criar endpoint dedicado. Schema:

```json
{
  "type": "map_search",
  "category": "pharmacy",
  "radiusKm": 5,
  "center": null
}
```

- Campo JSON: `metadata.map_action` (snake_case, alinhado às specs)
- TypeScript interno: VO `MapAction`, propriedade `mapAction`
- Prisma: coluna `messages.metadata Json?` com `{ "map_action": { ... } }`
- Ausência de `metadata` ou `map_action` indica fluxo normal de chat

## Rationale

- Reutiliza contrato REST existente — zero breaking change no path HTTP
- Flutter já consome `MessageDto`; extensão opcional é retrocompatível
- Separa texto legível (`content`) de ação estruturada (`metadata`) — UI pode parsear sem regex no texto
- Histórico de conversas preserva handoffs para retomada

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Endpoint dedicado `/conversations/:id/map-action` | Contrato explícito | Novo endpoint; duplica turno de chat; story pede resposta unificada | Overhead desnecessário |
| Campo top-level `mapAction` no envelope | Visível sem aninhar | Quebra formato `MessageDto`; inconsistente com mensagens sem maps | Polui contrato base |
| JSON embebido no `content` | Sem migration | Frágil para parse; mistura apresentação e dados | Anti-pattern |
| WebSocket / evento push | Tempo real | Infra não existente no MVP | Escopo excessivo |

## Consequences

### Positive

- Handoff chat→mapas (bolt 015) consome um único POST de mensagem
- Mensagens antigas (`metadata: null`) continuam válidas
- Extensível para outros metadados futuros (ex.: checkpoint UI)

### Negative

- Migration Prisma necessária (`metadata Json?`)
- Flutter deve tratar snake_case `map_action` na borda JSON

### Risks

- **LLM emite JSON inválido**: mitigado por tool `search_nearby_place` + validação server-side via VO `MapAction`
- **Cliente tenta enviar metadata**: mitigado — metadata é write-only pelo servidor na mensagem assistant

## Related

- **Stories**: 003-location-intent-chat, 004-radius-suggestion-response, 007-chat-to-maps-handoff (UI)
- **Standards**: `api-conventions.md`
- **Previous ADRs**: ADR-001 (maps endpoints públicos — handoff mobile chama `/maps/search` depois)
