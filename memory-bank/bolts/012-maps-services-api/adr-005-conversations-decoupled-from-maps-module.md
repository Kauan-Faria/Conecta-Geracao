---
bolt: 012-maps-services-api
created: 2026-06-09T00:05:00Z
status: accepted
---

# ADR-005: ConversationsModule desacoplado do MapsModule no fluxo de chat

## Context

O bolt `011-maps-services-api` implementou `SearchPoisUseCase`, `GeocodePlaceUseCase` e gateways HTTP para Google Maps Platform no `MapsModule`. O bolt `012` estende o chat para detectar intenção geográfica e emitir `map_action`.

Há tentação de injetar `SearchPoisUseCase` no `SendMessageUseCase` para "já retornar resultados POI" ou geocodificar bairros mencionados pelo usuário. Isso acoplaria latência de busca maps (~4s p95) ao fluxo de chat (p95 < 8s), misturaria bounded contexts e violaria a fronteira definida no domain model (handoff vs execução).

## Decision

O **`ConversationsModule` não importa nem injeta o `MapsModule`** no fluxo `SendMessageUseCase`. Especificamente:

- Sem chamadas a `SearchPoisUseCase`, `GeocodePlaceUseCase`, `GetStaticRouteUseCase`
- Sem HTTP para Google Maps Platform a partir do chat
- `SendMessageUseCase` emite `metadata.map_action` como **intenção de handoff**
- Execução real da busca fica no **Flutter** → `POST /api/v1/maps/search` (MapsModule)
- Compartilhamento permitido: VOs/enums puros (`PoiCategory`, `SearchRadius`) via import de tipos, sem DI cross-module

## Rationale

- Separação clara: chat = orquestração conversacional + LLM; maps = proxy Google + busca
- Evita timeout duplo (LLM + Places/Geocoding) numa única requisição de mensagem
- ADR-001 já expõe `/maps/*` para guest — mobile pode buscar após handoff sem auth extra
- Alinha com stories: 003 pede `map_action`, não lista de POIs no chat

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Injetar `SearchPoisUseCase` no chat | Resultados imediatos no chat | Acoplamento; latência; escopo story 003 | Handoff explícito é o contrato |
| Geocode no SendMessage (Geocoding API) | `center` preenchido quando usuário cita bairro | Quota Google; latência extra | Mobile geocodifica via `/maps/geocode` (bolt 015) |
| Import MapsModule só para GeocodePlace | Parcialmente desacoplado | Ainda acopla infra maps ao chat | Viola fronteira de bounded context |
| Event bus async (chat emite, maps consome) | Desacoplamento temporal | Infra inexistente no MVP | Over-engineering |

## Consequences

### Positive

- `SendMessageUseCase` permanece testável com mock de LLM apenas
- Falha Places/Geocoding não derruba resposta de chat
- MapsModule evolui independentemente (cache, circuit breaker)

### Negative

- Usuário precisa confirmar handoff no app antes de ver POIs (bolt 015)
- `center` pode ficar null — app depende de GPS

### Risks

- **Duplicação de enums categoria/raio**: mitigado por VOs compartilhados em `maps/domain`
- **Desalinhamento contrato map_action vs /maps/search**: mitigado por reutilizar mesmos valores enum no design técnico

## Related

- **Stories**: 003-location-intent-chat, 004-radius-suggestion-response
- **Standards**: `coding-standards.md` (hexagonal), `system-architecture.md`
- **Previous ADRs**: ADR-011 (Google Maps no MapsModule), ADR-004 (metadata.map_action)
