---
id: 022-auth-ui-foundation
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
type: simple-construction-bolt
status: complete
stories:
  - 001-auth-shared-components
  - 002-phone-screens-redesign
  - 003-welcome-screen-polish
created: 2026-06-11T22:00:00.000Z
started: 2026-06-11T23:45:00.000Z
completed: "2026-06-11T23:46:01Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-06-11T23:45:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-06-12T00:15:00.000Z
    artifact: implementation-walkthrough.md
requires_bolts:
  - 021-mobile-auth-login-gate-refactor
enables_bolts:
  - 023-email-password-auth
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 022-auth-ui-foundation

## Overview

Fundação visual do fluxo de auth: componentes compartilhados alinhados a `public/telas/`, redesign das telas telefone/OTP e polish final da welcome.

## Objective

Entregar a base de UI reutilizável e as telas 1–3 do mockup (welcome, telefone, confirmar telefone) sem alterar a lógica Firebase de telefone.

## Stories Included

- **001-auth-shared-components**: `AuthBrandHeader`, `AuthCtaButton`, `AuthScreenScaffold`
- **002-phone-screens-redesign**: `PhoneLoginPage` + `PhoneOtpPage` + `OtpPinInput` (6 caixas)
- **003-welcome-screen-polish**: `LoginPage` 100% fiel ao mockup

## Bolt Type

**Type**: simple-construction-bolt

## Stages

- [x] **1. plan** → `implementation-plan.md`
- [x] **2. implement** → `apps/mobile/lib/features/auth/presentation/`
- [ ] **3. test** → `test-walkthrough.md`

## Scope of Work

### Novos arquivos (sugeridos)

```text
apps/mobile/lib/features/auth/presentation/widgets/
  auth_brand_header.dart
  auth_cta_button.dart
  auth_screen_scaffold.dart
  otp_pin_input.dart
  brazil_phone_field.dart
```

### Arquivos a refatorar

- `login_page.dart`
- `phone_login_page.dart`
- `phone_otp_page.dart`

## Dependencies

### Requires
- **021-mobile-auth-login-gate-refactor** — login gate e convidado estáveis

### Enables
- **023-email-password-auth** — reutiliza componentes compartilhados

## Success Criteria

- [ ] Welcome, telefone e OTP visualmente alinhados a `public/telas/`
- [ ] OTP em 6 caixas com autofill SMS
- [ ] "Se cadastrar de outra forma" aponta para `/login/email` (rota pode ser stub até bolt 023)
- [ ] Testes widget das telas refatoradas passando
- [ ] Sem regressão convidado / telefone / Google

## Reference

Mockups: `public/telas/Captura de tela 2026-06-11 191528.png` (welcome), `191536.png` (telefone), `191540.png` (OTP)
