---
stage: plan
bolt: 007-digital-guidance-ui
created: 2026-06-02T22:08:28Z
---

## Implementation Plan: 007-digital-guidance-ui

### Objective

Permitir que o usuário autenticado veja conversas anteriores, retome o chat com histórico carregado e leia conversas já sincronizadas sem internet, com aviso claro ao tentar enviar mensagem offline.

### Deliverables

- Correção do parsing do envelope `{ data, meta }` da API em `ConversationsApi` (necessário para list/get/create/send)
- `ConversationsApi.listConversations(page, limit)` com modelo paginado
- `ChatRepository` estendido: `listConversations`, `getConversation`
- Tela **Minhas conversas** (`ConversationListPage`) com lista acessível (data + título/tópico)
- Paginação/infinite scroll na lista (page size 20)
- `ChatController`: `openConversation(id)` para carregar mensagens existentes; estado `isOffline`
- Cache local via `SharedPreferences` (últimas **10** conversas com detalhe completo)
- Sincronização do cache após fetch online; leitura cache-first quando offline
- Bloqueio de envio offline com mensagem: *"Precisa de internet para falar com o assistente"*
- Rota `/conversations` no shell + entrada na UI (botão no `ChatPage` ou `HomePage`)
- Helper `topic_display_label.dart` com rótulos PT-BR dos 6 slugs MVP
- Testes: parsing paginado, cache repository, widget da lista, fluxo offline no controller

### Dependencies

- **006-digital-guidance-ui** (complete): feature `chat/`, `ConversationsApi`, `ChatController`, `ChatPage`
- **005-ai-assistant-api**: `GET /api/v1/conversations`, `GET /api/v1/conversations/:id`
- **shared_preferences**: já no projeto; padrão igual `GuestHistoryRepository`
- **connectivity_plus** (opcional): detectar offline de forma explícita; alternativa: falha de rede + cache hit

### Technical Approach

1. **API envelope**: helper `_dataFromResponse(Map)` em `conversations_api.dart` (ou `ApiClient`) para extrair `data` e `meta` de todas as respostas.
2. **Lista**: `ConversationListController` (Notifier) mantém `items`, `page`, `hasMore`, `isLoading`; `ScrollController` listener dispara próxima página.
3. **Abrir conversa**: navegar para `/chat?conversationId=...` (query param no `GoRoute`); `ChatPage` chama `openConversation` no `initState`.
4. **Cache**: chave `cached_conversations_v1` — JSON array de `ConversationDetail` serializado; ao abrir conversa online, `upsert` no cache; ao listar offline, mesclar cache com ordem por `updatedAt`.
5. **Offline envio**: antes de `sendMessage`, se `isOffline` → setar `errorMessage` fixo da story (sem chamar API).
6. **Conversas longas offline**: `ListView.builder` no chat (já usa ListView); para listas >200 msgs, exibir só últimas 100 com botão "Ver mensagens anteriores" (expandir em lotes de 50).
7. **Título na lista**: `topicSlug` → label PT; se `topicSlug` null, primeira linha da última mensagem user (truncada) ou "Conversa".

### Acceptance Criteria

- [ ] **003**: Lista com data e título/tópico em "Minhas conversas"
- [ ] **003**: Toque na conversa abre chat com histórico de mensagens
- [ ] **003**: Lista grande com paginação/lazy load sem travar UI
- [ ] **004**: Sem conexão, conversas cacheadas são legíveis
- [ ] **004**: Sem conexão, enviar mensagem mostra aviso obrigatório
- [ ] **004**: Conversa longa offline renderiza sem crash (paginação/truncamento)
