---
stage: implement
bolt: 021-mobile-auth-login-gate-refactor
created: 2026-06-11T15:00:00Z
---

## Implementation Walkthrough: 001-mobile-auth-shell

### Summary

Refatoração do fluxo de entrada mobile: login como gate único, link convidado na `LoginPage` e sessão guest somente em memória (sem restauração entre cold starts). A rota `/welcome` foi removida do router.

### Structure Overview

O gate de autenticação no `GoRouter` redireciona usuários sem acesso para `/login`. O estado guest vive em repositórios in-memory injetados via Riverpod; na inicialização do app, um cleaner remove chaves legadas de SharedPreferences de versões anteriores.

### Completed Work

- [x] `apps/mobile/lib/core/routing/app_router.dart` — `initialLocation` e redirect para `/login`; rota `/welcome` removida
- [x] `apps/mobile/lib/features/auth/presentation/login_page.dart` — link "Sem cadastro, sem complicações" com `enterAsGuest()` e invalidação do chat
- [x] `apps/mobile/lib/features/auth/data/guest_session_repository.dart` — `InMemoryGuestSessionRepository` + `GuestSessionLegacyCleaner`
- [x] `apps/mobile/lib/features/auth/data/guest_history_repository.dart` — `InMemoryGuestHistoryRepository` (sem persistência entre visitas)
- [x] `apps/mobile/lib/core/routing/guest_session_gate.dart` — simplificado; não restaura guest de prefs
- [x] `apps/mobile/lib/features/auth/presentation/guest_session_controller.dart` — providers in-memory + limpeza de prefs legadas no boot
- [x] `apps/mobile/lib/features/auth/presentation/welcome_page.dart` — removido
- [x] `apps/mobile/test/features/auth/auth_routing_test.dart` — expectativas de login gate e prefs legadas
- [x] `apps/mobile/test/features/auth/guest_chat_controller_test.dart` — teste de cold start com gate fresco
- [x] `apps/mobile/test/helpers/maps_test_helpers.dart` — guest via UI na login
- [x] `apps/mobile/test/features/chat/chat_page_test.dart` — guest via link na login
- [x] `apps/mobile/test/helpers/fake_push_messaging_client.dart` — helper de teste (Firebase mock)
- [x] `apps/mobile/test/helpers/fake_notifications_remote_port.dart` — helper de teste (API mock)

### Key Decisions

- **In-memory em vez de limpar prefs no refresh**: evita restauração acidental e alinha com FR-8.2; prefs legadas são limpas uma vez no boot via `GuestSessionLegacyCleaner`
- **Remoção completa de `/welcome`**: login é a única porta de entrada; reduz confusão de fluxo
- **Testes de widget com mocks de notificação**: necessário para isolar roteamento/auth sem Firebase nem timers de retry da API

### Deviations from Plan

- Teste widget de "restart do app" substituído por teste unitário de gate fresco (`guest session is inactive on fresh gate after cold start`) — mais estável e cobre o mesmo comportamento
- Helpers de teste de notificações adicionados além do escopo original (pré-requisito para testes de widget com `ConectaGeracaoApp`)

### Dependencies Added

- Nenhuma

### Developer Notes

- Usuários que tinham sessão guest persistida em SharedPreferences verão login na próxima abertura (comportamento desejado)
- `enterAsGuest()` continua invalidando `chatControllerProvider` para reiniciar o chat na visita atual
