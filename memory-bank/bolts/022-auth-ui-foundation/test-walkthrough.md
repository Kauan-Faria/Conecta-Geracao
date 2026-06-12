---
stage: test
bolt: 022-auth-ui-foundation
created: 2026-06-11T23:44:39Z
---

## Test Report: 001-mobile-auth-login-ui

### Summary

- **Tests**: 16/16 passed (escopo deste bolt)
- **Coverage**: Não medido neste bolt (widget tests focados em comportamento visual e roteamento)

### Test Files

- [x] `apps/mobile/test/features/auth/auth_ui_widgets_test.dart` — `AuthCtaButton` (touch target, semantics, ícone) e `OtpPinInput` (6 caixas, dígitos visíveis)
- [x] `apps/mobile/test/features/auth/auth_phone_screens_test.dart` — Copy do mockup, validação de telefone, layout OTP e fluxo não-BR (atualizado pelo bolt 024)
- [x] `apps/mobile/test/features/auth/auth_routing_test.dart` — Gate `/login`, fluxo telefone, stub `/login/email`, convidado e cold start

### Acceptance Criteria Validation

- ✅ **Welcome, telefone e OTP alinhados aos mockups**: Textos e layout verificados nos testes widget
- ✅ **OTP em 6 caixas com autofill SMS**: `OtpPinInput` com `AutofillHints.oneTimeCode`
- ✅ **"Se cadastrar de outra forma" → `/login/email`**: Teste de roteamento passando
- ✅ **"Voltar e editar telefone" preserva número**: `context.pop()` mantém state do `PhoneLoginPage`
- ✅ **Testes widget passando**: 16/16 no escopo do bolt
- ✅ **Sem regressão convidado/telefone**: Testes de guest e cold start inalterados e passando

### Issues Found

Nenhum

### Notes

- Testes de roteamento usam viewport 400×900px; overflow no CTA foi corrigido com `Flexible` no label
- `auth_phone_screens_test.dart` inclui cenários do seletor internacional (bolt 024); regressão BR confirmada
