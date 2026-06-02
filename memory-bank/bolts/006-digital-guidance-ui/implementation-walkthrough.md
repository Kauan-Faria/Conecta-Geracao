---
stage: implement
bolt: 006-digital-guidance-ui
created: 2026-06-01T20:30:00Z
---

## Implementation Walkthrough: 006-digital-guidance-ui

### Summary

Tela de chat acessível implementada no Flutter, conectada à API de conversas. Layout segue o mockup: hero teal com robô, bolhas de mensagem, indicador "Pensando...", input com botão Gravar (stub) e quick replies Sim/Não para checkpoints.

### Structure Overview

Feature `features/chat/` com camadas domain (mensagens, detector de checkpoint), data (API/repositório) e presentation (controller Riverpod + página e widgets). `ApiClient` ganhou GET/POST e `ApiException` para erros amigáveis.

### Completed Work

- [x] `apps/mobile/lib/core/network/api_exception.dart` — mapeamento de erros da API
- [x] `apps/mobile/lib/core/network/api_client.dart` — HTTP com Bearer e X-Request-Id
- [x] `apps/mobile/lib/features/chat/domain/chat_message.dart` — modelos de mensagem e conversa
- [x] `apps/mobile/lib/features/chat/domain/checkpoint_detector.dart` — heurística Sim/Não
- [x] `apps/mobile/lib/features/chat/data/conversations_api.dart` — cliente REST conversas
- [x] `apps/mobile/lib/features/chat/data/chat_repository.dart` — contrato e implementação remota
- [x] `apps/mobile/lib/features/chat/presentation/chat_controller.dart` — estado e envio de mensagens
- [x] `apps/mobile/lib/features/chat/presentation/chat_page.dart` — tela principal do chat
- [x] `apps/mobile/lib/features/chat/presentation/widgets/chat_hero_header.dart` — banner do mockup
- [x] `apps/mobile/lib/features/chat/presentation/widgets/chat_message_bubble.dart` — bolhas user/assistant
- [x] `apps/mobile/lib/features/chat/presentation/widgets/chat_typing_indicator.dart` — "Pensando..."
- [x] `apps/mobile/lib/features/chat/presentation/widgets/checkpoint_quick_replies.dart` — Sim/Não
- [x] `apps/mobile/lib/features/chat/presentation/widgets/chat_input_bar.dart` — input + Gravar
- [x] `apps/mobile/lib/features/chat/presentation/widgets/chat_error_banner.dart` — erro com retry
- [x] `apps/mobile/lib/core/routing/app_router.dart` — rota `/chat` usa ChatPage
- [x] `apps/mobile/test/features/chat/` — testes unitários e de widget
- [x] `apps/mobile/test/helpers/fake_chat_repository.dart` — mock para testes

### Key Decisions

- **Checkpoints por heurística**: API não expõe flag; UI mostra Sim/Não quando última msg assistant contém `?` ou frases de checkpoint.
- **Convidado sem token**: CTA de login no chat; API exige Firebase Bearer.
- **Gravar**: botão visível no mockup, funcionalidade de voz deixada para bolt futuro (snackbar informativo).
- **API_BASE_URL**: default `http://localhost:3000`; em dispositivo físico usar `--dart-define=API_BASE_URL=...`.

### Deviations from Plan

- Grade de bancos do mockup (Nubank, Itaú, etc.) fica no bolt 008 (atalhos de tópicos).

### Dependencies Added

- [x] `http` — chamadas REST no ApiClient

### Developer Notes

- Backend deve estar rodando com seed dos 6 tópicos para respostas RAG completas.
- Android emulator: `API_BASE_URL=http://10.0.2.2:3000`.
