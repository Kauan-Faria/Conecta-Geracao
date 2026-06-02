---
stage: implement
bolt: 008-digital-guidance-ui
created: 2026-06-02T23:45:00Z
---

## Implementation Walkthrough: 008-digital-guidance-ui

### Summary

Grade de 6 atalhos de tópicos MVP na tela de chat vazia. Ao tocar, o app cria conversa com `topicSlug` na API e envia mensagem inicial contextual para disparar resposta RAG do assistente.

### Structure Overview

Camada domain ganhou lista fixa `mvpTopicShortcuts` alinhada aos slugs do backend. Presentation recebeu widget `TopicShortcutsGrid` e método `startWithTopic` no `ChatController`. `ChatPage` exibe a grade no estado vazio (autenticado, online).

### Completed Work

- [x] `apps/mobile/lib/features/chat/domain/topic_shortcuts.dart` — modelo, lista MVP e lookup por slug
- [x] `apps/mobile/lib/features/chat/presentation/widgets/topic_shortcuts_grid.dart` — grade 2×3 acessível com ícone + rótulo
- [x] `apps/mobile/lib/features/chat/presentation/chat_controller.dart` — `startWithTopic(slug)` com create + send
- [x] `apps/mobile/lib/features/chat/presentation/chat_page.dart` — integração da grade no chat vazio
- [x] `apps/mobile/test/features/chat/topic_shortcuts_test.dart` — lista e mensagens iniciais
- [x] `apps/mobile/test/features/chat/chat_controller_start_with_topic_test.dart` — fluxo online/offline
- [x] `apps/mobile/test/features/chat/chat_page_test.dart` — visibilidade e toque no atalho PIX
- [x] `apps/mobile/test/helpers/fake_chat_repository.dart` — rastreio de `lastCreateTopicSlug`

### Key Decisions

- **Rótulos curtos na grade**: PIX, Gov.br, etc. (story); rótulos longos permanecem em `topic_display_label.dart` para histórico
- **Mensagem inicial automática**: `"Quero ajuda com {rótulo}"` enviada após create para obter resposta imediata do assistente
- **Offline**: grade oculta quando `isOffline`; `startWithTopic` bloqueia com mesma mensagem de envio offline

### Deviations from Plan

None

### Dependencies Added

None

### Developer Notes

- Hot reload no `flutter run` ativo deve refletir a grade no chat vazio após login
- Backend precisa estar rodando com seed dos 6 tópicos para respostas RAG completas
