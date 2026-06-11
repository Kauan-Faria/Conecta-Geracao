---
last_updated: 2026-06-10T12:00:00Z
total_decisions: 11
---

# Decision Index

This index tracks all Architecture Decision Records (ADRs) created during Construction bolts.
Use this to find relevant prior decisions when working on related features.

## How to Use

**For Agents**: Scan the "Read when" fields below to identify decisions relevant to your current task. Before implementing new features, check if existing ADRs constrain or guide your approach. Load the full ADR for matching entries.

**For Humans**: Browse decisions chronologically or search for keywords. Each entry links to the full ADR with complete context, alternatives considered, and consequences.

---

## Decisions

### ADR-011: Google Maps Platform como provedor backend de maps
- **Status**: accepted
- **Date**: 2026-06-10
- **Bolt**: 011-maps-services-api (001-maps-services-api)
- **Path**: `bolts/011-maps-services-api/adr-011-google-maps-platform.md`
- **Summary**: Backend MapsModule migra de OSM (Overpass/Nominatim/OSRM) para Google Maps Platform — Geocoding, Places Nearby Search e Directions — via GOOGLEMAPS_API_KEY. Tiles Flutter continuam OSM. Supersedes ADR-003.
- **Read when**: Implementando integrações maps backend, configurando chaves Google, ou avaliando billing/quota de mapas

### ADR-010: Processamento síncrono de campanhas in-process
- **Status**: accepted
- **Date**: 2026-06-09
- **Bolt**: 018-notifications-api (001-notifications-api)
- **Path**: `bolts/018-notifications-api/adr-010-synchronous-campaign-processing.md`
- **Summary**: Campanhas processadas no handler HTTP com loop sequencial sobre destinatários elegíveis, contadores na response 201 e batch limit configurável. Fila async fica para fase futura.
- **Read when**: Implementando envio de campanhas admin, otimizando performance de batch push, ou avaliando fila async vs síncrono

### ADR-009: Catálogo de dicas educativas via Prisma seed
- **Status**: accepted
- **Date**: 2026-06-09
- **Bolt**: 018-notifications-api (001-notifications-api)
- **Path**: `bolts/018-notifications-api/adr-009-educational-tips-prisma-seed-catalog.md`
- **Summary**: Dicas curadas em tabela educational_tips populada por prisma db seed; runtime read-only com CuratedContentPolicy. LLM e YAML runtime rejeitados.
- **Read when**: Adicionando ou alterando dicas educativas, implementando job semanal de tips, ou validando conteúdo curado vs dinâmico

### ADR-008: Autenticação de campanhas via internal service key
- **Status**: accepted
- **Date**: 2026-06-09
- **Bolt**: 018-notifications-api (001-notifications-api)
- **Path**: `bolts/018-notifications-api/adr-008-internal-service-key-campaign-auth.md`
- **Summary**: POST /notifications/campaigns protegido por header X-Internal-Service-Key comparado a env NOTIFICATIONS_INTERNAL_SERVICE_KEY, com ThrottlerGuard. Firebase admin role fica para fase futura.
- **Read when**: Implementando endpoints internos de notificações, guards de auth ops, ou rotacionando secrets de campanha

### ADR-007: Analytics notification_sent via Pino structured logger no MVP
- **Status**: accepted
- **Date**: 2026-06-09
- **Bolt**: 018-notifications-api (001-notifications-api)
- **Path**: `bolts/018-notifications-api/adr-007-notification-sent-via-pino-structured-logger.md`
- **Summary**: NotificationAnalyticsPort implementado com PinoNotificationAnalyticsAdapter emitindo event=notification_sent após FCM success, sem PII. Firebase Analytics server-side fora do MVP.
- **Read when**: Implementando analytics de notificações, estendendo SendPushNotificationUseCase, ou integrando funil notification_sent com observabilidade

### ADR-006: NotificationsModule desacoplado do ConversationsModule nos triggers push
- **Status**: accepted
- **Date**: 2026-06-09
- **Bolt**: 017-notifications-api (001-notifications-api)
- **Path**: `bolts/017-notifications-api/adr-006-notifications-decoupled-from-conversations-module.md`
- **Summary**: Notifications não importa ConversationsModule; leitura de conversas abandonadas via adapter Prisma read-only; trigger IA exportado para chat com fire-and-forget. Alinha com ADR-005.
- **Read when**: Implementando triggers push, jobs de lembrete, hook pós-resposta IA, ou integração notifications ↔ conversations

### ADR-005: ConversationsModule desacoplado do MapsModule no chat
- **Status**: accepted
- **Date**: 2026-06-09
- **Bolt**: 012-maps-services-api (001-maps-services-api)
- **Path**: `bolts/012-maps-services-api/adr-005-conversations-decoupled-from-maps-module.md`
- **Summary**: O chat emite map_action como intenção de handoff sem chamar SearchPoisUseCase ou gateways de mapas. ConversationsModule não importa MapsModule; busca real fica no Flutter via REST /maps/search.
- **Read when**: Estendendo SendMessageUseCase, integrando chat com maps, ou avaliando se o backend deve executar busca POI dentro do fluxo de mensagens

### ADR-004: Handoff de mapas via metadata.map_action na mensagem assistant
- **Status**: accepted
- **Date**: 2026-06-09
- **Bolt**: 012-maps-services-api (001-maps-services-api)
- **Path**: `bolts/012-maps-services-api/adr-004-map-action-via-message-metadata.md`
- **Summary**: Payload map_action anexado em metadata.map_action da mensagem assistant no endpoint POST /conversations/:id/messages existente, sem endpoint dedicado. Schema type map_search com category, radiusKm e center opcional.
- **Read when**: Implementando handoff chat→mapas, parse de resposta de mensagem no Flutter, ou definindo contrato JSON de ações estruturadas no chat

### ADR-003: Stack OSM pública gratuita como dependência de maps
- **Status**: superseded
- **Date**: 2026-06-08
- **Bolt**: 011-maps-services-api (001-maps-services-api)
- **Path**: `bolts/011-maps-services-api/adr-003-public-osm-stack.md`
- **Summary**: ~~MVP de maps com Overpass/Nominatim/OSRM~~ **Supersedido por ADR-011** (Google Maps backend). Tiles Flutter OSM mantidos.
- **Read when**: Consultando histórico de decisões; não usar para implementação backend atual

### ADR-002: Cache in-memory para geocodificação
- **Status**: accepted
- **Date**: 2026-06-08
- **Bolt**: 011-maps-services-api (001-maps-services-api)
- **Path**: `bolts/011-maps-services-api/adr-002-in-memory-geocode-cache.md`
- **Summary**: Cache in-memory com TTL configurável para geocode. Reduz quota e latência da Google Geocoding API (ADR-011).
- **Read when**: Implementando caching strategies ou escalando instâncias do módulo maps

### ADR-001: Endpoints públicos de maps sem Firebase Auth no MVP
- **Status**: accepted
- **Date**: 2026-06-08
- **Bolt**: 011-maps-services-api (001-maps-services-api)
- **Path**: `bolts/011-maps-services-api/adr-001-public-maps-endpoints.md`
- **Summary**: A story 001 explicita que guest pode usar busca de lugares no MVP. Expor endpoints /maps/* sem FirebaseAuthGuard, protegidos por ThrottlerGuard global.
- **Read when**: Trabalhando em autenticação de endpoints maps, fluxo guest no app, ou adicionando guards ao módulo maps
