---
last_updated: 2026-06-09T00:05:00Z
total_decisions: 5
---

# Decision Index

This index tracks all Architecture Decision Records (ADRs) created during Construction bolts.
Use this to find relevant prior decisions when working on related features.

## How to Use

**For Agents**: Scan the "Read when" fields below to identify decisions relevant to your current task. Before implementing new features, check if existing ADRs constrain or guide your approach. Load the full ADR for matching entries.

**For Humans**: Browse decisions chronologically or search for keywords. Each entry links to the full ADR with complete context, alternatives considered, and consequences.

---

## Decisions

### ADR-005: ConversationsModule desacoplado do MapsModule no chat
- **Status**: accepted
- **Date**: 2026-06-09
- **Bolt**: 012-maps-services-api (001-maps-services-api)
- **Path**: `bolts/012-maps-services-api/adr-005-conversations-decoupled-from-maps-module.md`
- **Summary**: O chat emite map_action como intenção de handoff sem chamar SearchPoisUseCase ou gateways OSM. ConversationsModule não importa MapsModule; busca real fica no Flutter via REST /maps/search.
- **Read when**: Estendendo SendMessageUseCase, integrando chat com maps, ou avaliando se o backend deve executar busca POI dentro do fluxo de mensagens

### ADR-004: Handoff de mapas via metadata.map_action na mensagem assistant
- **Status**: accepted
- **Date**: 2026-06-09
- **Bolt**: 012-maps-services-api (001-maps-services-api)
- **Path**: `bolts/012-maps-services-api/adr-004-map-action-via-message-metadata.md`
- **Summary**: Payload map_action anexado em metadata.map_action da mensagem assistant no endpoint POST /conversations/:id/messages existente, sem endpoint dedicado. Schema type map_search com category, radiusKm e center opcional.
- **Read when**: Implementando handoff chat→mapas, parse de resposta de mensagem no Flutter, ou definindo contrato JSON de ações estruturadas no chat

### ADR-003: Stack OSM pública gratuita como dependência de maps
- **Status**: accepted
- **Date**: 2026-06-08
- **Bolt**: 011-maps-services-api (001-maps-services-api)
- **Path**: `bolts/011-maps-services-api/adr-003-public-osm-stack.md`
- **Summary**: O MVP de maps precisa de busca POI, geocoding e rota estática sem custo de APIs pagas. Usar instâncias públicas default configuráveis por env com backend como proxy único.
- **Read when**: Implementando integrações maps, gateways Overpass/Nominatim/OSRM, tratamento de indisponibilidade ou troca de provedor de mapas

### ADR-002: Cache in-memory para geocodificação Nominatim
- **Status**: accepted
- **Date**: 2026-06-08
- **Bolt**: 011-maps-services-api (001-maps-services-api)
- **Path**: `bolts/011-maps-services-api/adr-002-in-memory-geocode-cache.md`
- **Summary**: Nominatim impõe máximo 1 requisição por segundo por instância. Implementar InMemoryGeocodeCache com TTL configurável e throttle no adapter.
- **Read when**: Implementando caching strategies, rate limiting de APIs externas, ou escalando instâncias Render do módulo maps

### ADR-001: Endpoints públicos de maps sem Firebase Auth no MVP
- **Status**: accepted
- **Date**: 2026-06-08
- **Bolt**: 011-maps-services-api (001-maps-services-api)
- **Path**: `bolts/011-maps-services-api/adr-001-public-maps-endpoints.md`
- **Summary**: A story 001 explicita que guest pode usar busca de lugares no MVP. Expor endpoints /maps/* sem FirebaseAuthGuard, protegidos por ThrottlerGuard global.
- **Read when**: Trabalhando em autenticação de endpoints maps, fluxo guest no app, ou adicionando guards ao módulo maps
