---
stage: test
bolt: 010-mobile-auth-phone
created: 2026-06-02T23:00:00Z
---

## Test Report: 010-mobile-auth-phone

### Summary

- **Tests**: 46/46 passed (`flutter test` em `apps/mobile`, 2026-06-02)
- **Coverage**: não medida (MVP — foco em fluxos críticos de auth e guest)

### Test Files

- [x] `test/features/auth/brazil_phone_formatter_test.dart` — E.164 e validação de telefone BR
- [x] `test/features/auth/auth_routing_test.dart` — welcome, guest, login telefone principal
- [x] `test/features/auth/guest_chat_controller_test.dart` — chat convidado sem token API
- [x] `test/features/chat/chat_page_test.dart` — guest com input e banner modo sem cadastro
- [x] `test/features/shell/app_shell_test.dart` — navegação autenticada (mock API)
- [x] `test/helpers/fake_auth_repository.dart` — stubs phone OTP e displayName

### Acceptance Criteria Validation

- ✅ **Login telefone (UI + fluxo)**: tela principal com "Receber código" e link alternativo — widget tests
- ⏳ **SMS real em dev**: requer Firebase Phone Auth + número de teste — **checklist manual**
- ✅ **Onboarding nome**: redirect `/onboarding/display-name` quando `displayName` vazio — implementado; validação manual recomendada
- ✅ **Google só em alternativa**: `AlternativeLoginPage`; login principal sem botão Google — widget test
- ✅ **OTP copy + autofill**: `PhoneOtpPage` com textos PT-BR e `AutofillHints.oneTimeCode` — revisão de código
- ✅ **Convidado efêmero**: chat local, histórico limpo ao entrar, sem API — unit + widget tests
- ⏳ **TalkBack/VoiceOver**: não automatizado — **checklist manual** (login, OTP, nome)
- ✅ **Google sem regressão**: `signInWithGoogle` preservado na tela alternativa — fake auth + routing

### Issues Found

- `app_shell_test` falhava com `pumpAndSettle` timeout sem mock de `CachedChatRepository` (loading infinito na home). **Corrigido** neste estágio.

### Manual Test Plan (pendente em dispositivo)

1. Configurar número de teste no Firebase Console.
2. Fluxo: Welcome → Começar → telefone → OTP → nome → home.
3. Fluxo alternativo: Entrar de outra forma → Google.
4. Convidado: experimentar chat → sair → reentrar → histórico vazio.
5. TalkBack no login, OTP e onboarding de nome.

### Notes

`flutter analyze lib test` sem issues. Bolt pronto para `bolt-complete.cjs` após aprovação final.
