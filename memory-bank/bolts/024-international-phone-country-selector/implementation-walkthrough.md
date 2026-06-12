---
stage: implement
bolt: 024-international-phone-country-selector
created: 2026-06-11T23:40:00Z
---

## Implementation Walkthrough: 024-international-phone-country-selector

### Summary

O campo de telefone estático `+55` foi substituído por um seletor internacional com bottom sheet pesquisável, máscaras por país e alinhamento visual entre seletor e número. O fluxo Firebase SMS permanece exclusivo para Brasil; demais países recebem mensagem amigável orientando cadastro alternativo.

### Structure Overview

Camada de domínio com catálogo estático de países e formatação E.164; widgets de apresentação para seletor e campo integrado; controller de auth validando país antes de chamar Firebase.

### Completed Work

- [x] `apps/mobile/lib/features/auth/domain/phone_country.dart` — catálogo (~55 países), busca, máscaras BR/US/PT e genérica, `toE164()` / `isComplete()`
- [x] `apps/mobile/lib/features/auth/presentation/widgets/country_code_selector.dart` — seletor compacto + bottom sheet com busca e lista acessível
- [x] `apps/mobile/lib/features/auth/presentation/widgets/international_phone_field.dart` — campo integrado com `IntrinsicHeight` e formatador por país
- [x] `apps/mobile/lib/features/auth/presentation/phone_login_page.dart` — usa `InternationalPhoneField`; limpa número ao trocar país
- [x] `apps/mobile/lib/features/auth/presentation/phone_auth_controller.dart` — bloqueio não-BR com mensagem PT-BR; `clearError()` para UX ao trocar país
- [x] `apps/mobile/lib/features/auth/presentation/widgets/brazil_phone_field.dart` — marcado `@Deprecated` (substituído por `InternationalPhoneField`)
- [x] `apps/mobile/test/features/auth/phone_country_test.dart` — máscaras, busca e escopo do catálogo
- [x] `apps/mobile/test/features/auth/international_phone_field_test.dart` — alinhamento, hint por país, formatação BR
- [x] `apps/mobile/test/features/auth/auth_phone_screens_test.dart` — fluxo não-BR, regressão BR, controller unit

### Key Decisions

- **Bottom sheet em vez de dropdown inline**: lista longa (~55 países) com busca e alvos ≥ 48dp, conforme story e UX guide
- **Delegação BR para `BrazilPhoneFormatter`**: evita regressão no E.164 e reutiliza lógica já testada
- **Bloqueio no controller, não no widget**: mensagem centralizada e testável; UI permanece igual para todos os países

### Deviations from Plan

Nenhuma.

### Dependencies Added

Nenhuma — apenas APIs Material/Flutter existentes.

### Developer Notes

- `resendCode` assume Brasil por padrão (OTP só é alcançado após SMS BR)
- Países NANP (+1) compartilham máscara `(000) 000-0000`; DDI repetido é intencional no catálogo
