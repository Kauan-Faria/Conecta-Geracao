---
stage: test
bolt: 007-digital-guidance-ui
created: 2026-06-02T22:35:00Z
---

## Test Report: 007-digital-guidance-ui

### Summary

- **Tests**: 16/16 passed (`flutter test test/features/chat/`)
- **Coverage**: caminhos críticos do bolt (envelope, cache, offline, widgets existentes)

### Test Files

- [x] `test/features/chat/api_envelope_test.dart` — unwrap data/meta da API
- [x] `test/features/chat/conversation_cache_repository_test.dart` — persistência e limite de 10
- [x] `test/features/chat/topic_display_label_test.dart` — rótulos e título da lista
- [x] `test/features/chat/chat_controller_offline_test.dart` — bloqueio de envio offline
- [x] `test/features/chat/chat_page_test.dart` — regressão chat + connectivity mock
- [x] `test/features/chat/chat_message_test.dart` — parsing de mensagens
- [x] `test/features/chat/checkpoint_detector_test.dart` — checkpoints

### Acceptance Criteria Validation

- ✅ **Lista com data e título/tópico**: `ConversationListPage` + labels
- ✅ **Toque abre chat com histórico**: rota com `conversationId` + `openConversation`
- ✅ **Paginação/lazy load**: scroll infinito page size 20
- ✅ **Offline leitura cache**: cache-first em list e open
- ✅ **Offline bloqueia envio**: mensagem `offlineSendMessage`
- ✅ **Conversa longa offline**: `displayMessages` + "Ver mensagens anteriores"

### Issues Found

Nenhum bloqueante nos testes automatizados.

### Notes

Validação manual recomendada: backend rodando, login Google, criar conversa, abrir "Minhas conversas", ativar modo avião e reler cache.
