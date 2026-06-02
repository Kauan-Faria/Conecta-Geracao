---
stage: test
bolt: 008-digital-guidance-ui
created: 2026-06-02T23:55:00Z
---

## Test Report: 008-digital-guidance-ui

### Summary

- **Tests**: 22/22 passed (suíte `test/features/chat/`)
- **Coverage**: não medido neste bolt; cobertura focada nos fluxos novos via unit + widget + controller

### Test Files

- [x] `test/features/chat/topic_shortcuts_test.dart` — 6 tópicos MVP, slugs, mensagens iniciais
- [x] `test/features/chat/chat_controller_start_with_topic_test.dart` — create com slug, envio, bloqueio offline
- [x] `test/features/chat/chat_page_test.dart` — grade visível no chat vazio, toque em PIX inicia conversa
- [x] `test/features/chat/chat_controller_offline_test.dart` — regressão envio offline (inalterado)
- [x] Demais testes do módulo chat — regressão geral (22 total)

### Acceptance Criteria Validation

- ✅ **6 cards no chat vazio**: PIX, Gov.br, WhatsApp, Wi-Fi, Boleto, Golpe — widget test confirma rótulos
- ✅ **Toque inicia conversa com topicSlug**: controller + widget test — `fazer-pix` enviado à API
- ✅ **Ícone + rótulo, alvo ≥ 48dp**: `TopicShortcutsGrid` usa `minTouchTarget` (48dp) e `Semantics`
- ✅ **Offline**: grade oculta (`showTopicShortcuts` false); `startWithTopic` bloqueado com mensagem padrão

### Issues Found

None

### Notes

- Validação manual recomendada: hot reload/restart com backend + login Google para ver resposta RAG real ao tocar um card
- `flutter run` ativo no dispositivo reflete a grade após autenticação
