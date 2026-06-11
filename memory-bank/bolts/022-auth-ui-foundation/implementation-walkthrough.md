---
stage: implement
bolt: 022-auth-ui-foundation
created: 2026-06-12T00:15:00Z
---

## Implementation Walkthrough: 001-mobile-auth-login-ui

### Summary

Fundação visual do fluxo de auth entregue: cinco widgets compartilhados reutilizáveis e redesign das telas welcome, telefone e OTP alinhados aos mockups. A lógica Firebase em `phone_auth_controller.dart` foi preservada integralmente.

### Structure Overview

Widgets compartilhados em `presentation/widgets/` compõem o layout base (`AuthScreenScaffold` + `AuthBrandHeader`). Telas internas substituíram `AppScaffold`/`AppButton` pelos novos componentes. Rota `/login/email` aponta para stub até o bolt 023.

### Completed Work

- [x] `apps/mobile/lib/features/auth/presentation/widgets/auth_brand_header.dart` - Logo + nome da marca com divisor opcional
- [x] `apps/mobile/lib/features/auth/presentation/widgets/auth_cta_button.dart` - CTA teal/azul com ícones de seta e estado loading
- [x] `apps/mobile/lib/features/auth/presentation/widgets/auth_screen_scaffold.dart` - Layout full-screen sem AppBar para telas internas
- [x] `apps/mobile/lib/features/auth/presentation/widgets/brazil_phone_field.dart` - Campo BR (+55) com máscara nacional
- [x] `apps/mobile/lib/features/auth/presentation/widgets/otp_pin_input.dart` - OTP em 6 caixas com autofill SMS
- [x] `apps/mobile/lib/features/auth/presentation/email_login_stub_page.dart` - Placeholder da rota `/login/email`
- [x] `apps/mobile/lib/features/auth/presentation/login_page.dart` - CTAs migrados para `AuthCtaButton`
- [x] `apps/mobile/lib/features/auth/presentation/phone_login_page.dart` - Redesign completo conforme mockup 191536
- [x] `apps/mobile/lib/features/auth/presentation/phone_otp_page.dart` - Redesign com 6 caixas conforme mockup 191540
- [x] `apps/mobile/lib/core/routing/app_router.dart` - Rota `/login/email` adicionada

### Key Decisions

- **OTP com campo oculto**: TextField invisível com `AutofillHints.oneTimeCode` sincroniza as 6 caixas visuais, preservando autofill nativo do SMS
- **Reenvio SMS como TextButton**: Mantido abaixo do input OTP (não está no mockup, mas preserva cooldown de 60s da story)
- **Rota e-mail como stub**: Página mínima com mensagem informativa; bolt 023 implementará o fluxo real

### Deviations from Plan

None

### Dependencies Added

- Nenhuma dependência nova

### Developer Notes

- `AuthCtaButton` usa `Flexible` no texto para evitar overflow em telas estreitas (ex.: testes em 400px)
- `context.pop()` na OTP preserva o número digitado na tela telefone (state do `PhoneLoginPage` mantido na pilha)
