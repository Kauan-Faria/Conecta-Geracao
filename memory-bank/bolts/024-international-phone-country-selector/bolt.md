---
id: 024-international-phone-country-selector
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
type: simple-construction-bolt
status: complete
stories:
  - 009-international-phone-country-selector
created: 2026-06-11T23:55:00.000Z
started: 2026-06-11T23:32:08.000Z
completed: "2026-06-11T23:42:18Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-06-11T23:35:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-06-11T23:40:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-06-11T23:39:00.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 022-auth-ui-foundation
enables_bolts: []
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 024-international-phone-country-selector

## Overview

Evoluir o campo de telefone de seletor estático BR (+55) para dropdown internacional (subconjunto Américas + Portugal + diáspora), com máscara por país, busca e alinhamento visual integrado ao campo de número.

## Objective

Entregar UX corrigida do seletor DDI + preparação visual para números internacionais, mantendo **Firebase SMS apenas para Brasil** no MVP.

## Stories Included

- **009-international-phone-country-selector**: `InternationalPhoneField`, catálogo `PhoneCountry`, máscaras, busca, bloqueio amigável fora do BR

## Bolt Type

**Type**: simple-construction-bolt

## Stages

- [x] **1. plan** → `implementation-plan.md`
- [x] **2. implement** → `apps/mobile/lib/features/auth/`
- [x] **3. test** → `test-walkthrough.md`

## Scope of Work

### Novos / alterados (sugeridos)

```text
apps/mobile/lib/features/auth/domain/
  phone_country.dart              # catálogo + máscaras
apps/mobile/lib/features/auth/presentation/widgets/
  international_phone_field.dart  # substitui/evolui brazil_phone_field.dart
  country_code_selector.dart      # dropdown/bottom sheet com busca
apps/mobile/lib/features/auth/presentation/
  phone_login_page.dart           # usa InternationalPhoneField
  phone_auth_controller.dart      # validação BR-only no MVP
test/features/auth/
  phone_country_test.dart
  international_phone_field_test.dart
```

## Dependencies

### Requires
- **022-auth-ui-foundation** — telas telefone/OTP e componentes base

### Enables
- Phone Auth internacional (fase futura)

## Success Criteria

- [x] Seletor e campo de número visualmente alinhados (sem desnível da screenshot reportada)
- [x] Dropdown com bandeiras, DDI e busca funcional
- [x] Máscaras corretas para BR, US/CA, PT e demais países do catálogo
- [x] SMS Firebase funciona só para BR; demais países → mensagem amigável
- [x] Testes widget/unit passando

## Reference

- Mockup telefone: `public/telas/Captura de tela 2026-06-11 191536.png`
- UX guide: `memory-bank/standards/ux-guide.md`
