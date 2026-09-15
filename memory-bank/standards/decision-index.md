---
last_updated: 2026-09-15T01:20:00Z
total_decisions: 18
---

# Decision Index

This index tracks all Architecture Decision Records (ADRs) created during Construction bolts.
Use this to find relevant prior decisions when working on related features.

## How to Use

**For Agents**: Scan the "Read when" fields below to identify decisions relevant to your current task. Before implementing new features, check if existing ADRs constrain or guide your approach. Load the full ADR for matching entries.

**For Humans**: Browse decisions chronologically or search for keywords. Each entry links to the full ADR with complete context, alternatives considered, and consequences.

---

## Decisions

### ADR-018: Retrieve de steps só no modo RAG
- **Status**: accepted
- **Date**: 2026-09-15
- **Bolt**: 032-rag-relevance-api (001-rag-relevance-api)
- **Path**: `bolts/032-rag-relevance-api/adr-018-skip-retrieve-unless-rag.md`
- **Summary**: O pipeline 005 sempre chama o retriever antes do prompt. O generator infere o TopicMatch primeiro e só executa retrieve se o modo for rag.
- **Read when**: Alterando GeminiAssistantReplyGenerator, KnowledgeRetriever, RagPromptBuilder, ou os modos clarify/general

### ADR-017: Streak de esclarecimento no metadata da mensagem
- **Status**: accepted
- **Date**: 2026-09-15
- **Bolt**: 032-rag-relevance-api (001-rag-relevance-api)
- **Path**: `bolts/032-rag-relevance-api/adr-017-clarification-streak-in-message-metadata.md`
- **Summary**: FR-3 limita a 2 esclarecimentos seguidos. A streak deriva de metadata.replyMode nas mensagens assistant, sem coluna SQL nova.
- **Read when**: Implementando limite de clarify, persistência de mensagens, guest chat, ou avaliando migration em Conversation

### ADR-016: Esclarecimento por template, sem LLM
- **Status**: accepted
- **Date**: 2026-09-15
- **Bolt**: 032-rag-relevance-api (001-rag-relevance-api)
- **Path**: `bolts/032-rag-relevance-api/adr-016-clarify-via-template.md`
- **Summary**: FR-3 exige perguntar de novo sem chutar tópico e sem RAG. O modo clarify usa templates curtos e não chama Gemini.
- **Read when**: Montando perguntas de esclarecimento, calibrando tom do chat, ou avaliando se clarify deve voltar a usar LLM

### ADR-015: topicSlug persistido é pista, não trava o retrieve
- **Status**: accepted
- **Date**: 2026-09-15
- **Bolt**: 031-rag-relevance-api (001-rag-relevance-api)
- **Path**: `bolts/031-rag-relevance-api/adr-015-persisted-slug-is-hint-not-lock.md`
- **Summary**: O retriever sempre infere a mensagem atual. Slug da conversa só reforça continuidade se não houver outro match `high`. Tie/low não caem de volta no tópico antigo.
- **Read when**: Alterando KnowledgeRetriever, SendMessage, resolvedTopicSlug, ou o fluxo de troca de assunto no chat

### ADR-014: Confiança high/tie/low/none e empate sem displayOrder
- **Status**: accepted
- **Date**: 2026-09-15
- **Bolt**: 031-rag-relevance-api (001-rag-relevance-api)
- **Path**: `bolts/031-rag-relevance-api/adr-014-confidence-thresholds-no-displayorder-tiebreak.md`
- **Summary**: TopicMatch usa limiares de score (piso 2, margem 2). Empate não escolhe o primeiro da lista. Keywords genéricas valem 0.5 e não fecham tópico sozinhas.
- **Read when**: Calibrando TopicInferencePolicy, pesos de alias/keyword, ou debugando tópico errado no RAG

### ADR-013: Aliases no aggregate KnowledgeTopic (Prisma seed)
- **Status**: accepted
- **Date**: 2026-09-15
- **Bolt**: 031-rag-relevance-api (001-rag-relevance-api)
- **Path**: `bolts/031-rag-relevance-api/adr-013-topic-aliases-on-knowledge-topic.md`
- **Summary**: Grafias alternativas ficam em `KnowledgeTopic.aliases` via seed Prisma, não em CMS nem em arquivo solto. Fallback temporário só se a migration bloquear.
- **Read when**: Adicionando grafias ao corpus, alterando seed dos 6 tópicos, ou mapeando KnowledgeTopic no Prisma

### ADR-012: Matching lexical + aliases + fuzzy, sem embeddings
- **Status**: accepted
- **Date**: 2026-09-15
- **Bolt**: 031-rag-relevance-api (001-rag-relevance-api)
- **Path**: `bolts/031-rag-relevance-api/adr-012-lexical-fuzzy-matching-no-embeddings.md`
- **Summary**: Classificação de tópico é normalização + aliases + Levenshtein em tokens ≥ 4. Sem pgvector e sem LLM para inferir tópico. Embeddings só se o corpus falhar com usuários.
- **Read when**: Mexendo em RAG, inferência de tópico, ou avaliando embeddings/vector search

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
