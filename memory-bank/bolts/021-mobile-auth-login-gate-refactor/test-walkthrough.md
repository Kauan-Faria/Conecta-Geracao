---
stage: test
bolt: 021-mobile-auth-login-gate-refactor
created: 2026-06-11T15:05:00Z
---

## Test Report: 001-mobile-auth-shell

### Summary

- **Tests**: 15/15 passed
- **Coverage**: não medido neste bolt (escopo: roteamento + guest efêmero)

### Test Files

- [x] `apps/mobile/test/features/auth/auth_routing_test.dart` — login como gate, guest via link, prefs legadas ignoradas
- [x] `apps/mobile/test/features/auth/guest_chat_controller_test.dart` — chat guest sem token, reset em memória, cold start sem guest
- [x] `apps/mobile/test/features/chat/chat_page_test.dart` — guest acessa chat via link na login (regressão)
- [x] `apps/mobile/test/features/shell/maps_navigation_test.dart` — guest acessa mapas via helper atualizado (regressão)

### Acceptance Criteria Validation

- ✅ **Sem login → tela de login**: `auth_routing_test` — `unauthenticated user sees login page`
- ✅ **Link convidado na LoginPage**: `auth_routing_test` — link visível; `guest user reaches home without login`
- ✅ **Guest efêmero entre cold starts**: `guest_chat_controller_test` — `guest session is inactive on fresh gate after cold start`; prefs legadas não restauram sessão
- ✅ **Autenticado → home sem regressão**: `chat_page_test` — `authenticated user sees chat hero and input`; `maps_navigation_test` — usuário autenticado abre mapas
- ✅ **Testes atualizados/passando**: 15/15 nos arquivos afetados

### Issues Found

- Nenhum bloqueador. Testes de widget precisaram de mocks de notificação (`FakePushMessagingClient`, `FakeNotificationsRemotePort`, bootstrap no-op) para evitar Firebase e timers pendentes — ajuste nos helpers de teste, não no código de produção.

### Notes

- Comando executado: `flutter test test/features/auth/auth_routing_test.dart test/features/auth/guest_chat_controller_test.dart test/features/chat/chat_page_test.dart test/features/shell/maps_navigation_test.dart`
- Resultado: All tests passed
