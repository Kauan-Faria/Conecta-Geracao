---
stage: test
bolt: 023-email-password-auth
created: 2026-06-12T02:45:00Z
---

## Test Report: 001-mobile-auth-login-ui

### Summary

- **Tests**: 32/32 passed (`test/features/auth/`)
- **Coverage**: caminhos críticos do bolt cobertos (erros, controller, gate, rotas); fluxo E2E Firebase requer dispositivo com console configurado

### Test Files

- [x] `test/features/auth/email_auth_error_messages_test.dart` — mapeamento PT-BR de erros e-mail/senha e reset
- [x] `test/features/auth/email_auth_controller_test.dart` — contador 4 tentativas, toggle modo, reset, validação senhas
- [x] `test/features/auth/email_verification_gate_test.dart` — lógica `userNeedsEmailVerification`
- [x] `test/features/auth/auth_routing_test.dart` — rota e-mail, redirect `/login/alternative`, guest sem regressão
- [x] `test/features/auth/auth_phone_screens_test.dart` — regressão telefone/OTP (bolt 022)
- [x] `test/features/auth/auth_ui_widgets_test.dart` — regressão componentes compartilhados
- [x] `test/features/auth/guest_chat_controller_test.dart` — regressão convidado

### Acceptance Criteria Validation

- ✅ **Cadastro e-mail → verificação → onboarding/home**: implementado (`EmailAuthPage` → `/login/email-verify` → redirect pós-`reload()`); E2E manual pendente Firebase Console
- ✅ **Login e-mail (verificado / não verificado)**: controller + navegação condicional em `EmailAuthPage`
- ✅ **Google na mesma tela**: `AuthCtaButton` secundário chama `signInWithGoogle()`
- ✅ **Esqueci senha após 4 erros**: `EmailAuthController` incrementa contador; banner + `sendPasswordResetEmail`
- ✅ **Telefone e convidado sem regressão**: 6 testes phone/guest passando
- ✅ **`/login/alternative` → `/login/email`**: widget test `legacy alternative route redirects`
- ✅ **Gate `emailVerified`**: `userNeedsEmailVerification` + redirect em `app_router.dart` com `ref.read` em tempo real
- ✅ **Testes unitários + widget**: 15 testes novos/alterados do bolt, todos passando
- ✅ **Erros Firebase PT-BR**: 3 testes em `email_auth_error_messages_test.dart`
- ✅ **Acessibilidade**: `Semantics` em CTAs, erros (`liveRegion`), toggle senha; `AuthCtaButton` ≥ 48dp

### Issues Found

- Nenhum bloqueador nos testes automatizados
- Validação em dispositivo real requer habilitar Email/Password no Firebase Console

### Notes

- Widget test de redirect para usuário não verificado substituído por teste unitário do gate + redirect `ref.read` (evita timeout de `pumpAndSettle` no app completo)
- Deep link de verificação de e-mail fora do escopo — fluxo manual via "Avançar" coberto
