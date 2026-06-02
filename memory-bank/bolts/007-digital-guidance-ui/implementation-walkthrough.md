---
stage: implement
bolt: 007-digital-guidance-ui
created: 2026-06-02T22:30:00Z
---

## Implementation Walkthrough: 007-digital-guidance-ui

### Summary

Histórico de conversas paginado e cache offline no app Flutter. Usuário autenticado acessa "Minhas conversas", retoma chats com histórico e lê conversas sincronizadas sem internet; envio bloqueado offline com mensagem da story.

### Structure Overview

Camada `data/` ganhou cache em SharedPreferences e repositório composto (`CachedChatRepository`). `core/network/` recebeu parsing do envelope API e serviço de conectividade. Presentation inclui `ConversationListPage` + controller e extensões no `ChatController`/`ChatPage`.

### Completed Work

- [x] `apps/mobile/lib/core/network/api_envelope.dart` — unwrap `data`/`meta` e tipo paginado
- [x] `apps/mobile/lib/core/network/connectivity_service.dart` — detecção online/offline
- [x] `apps/mobile/lib/features/chat/data/conversations_api.dart` — list + envelope fix
- [x] `apps/mobile/lib/features/chat/data/conversation_cache_repository.dart` — cache local (10 conversas)
- [x] `apps/mobile/lib/features/chat/data/chat_repository.dart` — list/get + cache composto
- [x] `apps/mobile/lib/features/chat/domain/topic_display_label.dart` — rótulos PT-BR dos tópicos
- [x] `apps/mobile/lib/features/chat/domain/chat_message.dart` — serialização JSON para cache
- [x] `apps/mobile/lib/features/chat/presentation/conversation_list_controller.dart` — lista paginada
- [x] `apps/mobile/lib/features/chat/presentation/conversation_list_page.dart` — tela Minhas conversas
- [x] `apps/mobile/lib/features/chat/presentation/chat_controller.dart` — openConversation, offline
- [x] `apps/mobile/lib/features/chat/presentation/chat_page.dart` — histórico, truncamento, offline UX
- [x] `apps/mobile/lib/features/chat/presentation/widgets/chat_hero_header.dart` — link Minhas conversas
- [x] `apps/mobile/lib/features/chat/presentation/widgets/chat_input_bar.dart` — disable offline
- [x] `apps/mobile/lib/features/chat/presentation/widgets/chat_error_banner.dart` — retry opcional
- [x] `apps/mobile/lib/core/routing/app_router.dart` — rotas `/conversations` e query no chat
- [x] `apps/mobile/test/features/chat/` — testes envelope, cache, offline, labels
- [x] `apps/mobile/pubspec.yaml` — `connectivity_plus`

### Key Decisions

- **SharedPreferences em vez de Hive**: já usado no projeto; JSON para até 10 conversas completas.
- **CachedChatRepository**: sync automático após list/get; leitura cache-first offline.
- **Truncamento offline**: últimas 100 mensagens + botão "Ver mensagens anteriores" (+50).
- **Envelope API**: correção centralizada; necessária para list/create/get funcionarem com interceptor Nest.

### Deviations from Plan

- Rota final: `/conversations` (branch do chat no shell), não tab separada na bottom bar.

### Dependencies Added

- [x] `connectivity_plus` — detecção de rede para UX offline

### Developer Notes

- Hot restart após `flutter pub get` por causa do `connectivity_plus`.
- Lista usa `context.go('/chat?conversationId=...')` para abrir conversa na mesma branch.
