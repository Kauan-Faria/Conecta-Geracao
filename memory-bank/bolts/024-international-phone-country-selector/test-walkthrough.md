---
stage: test
bolt: 024-international-phone-country-selector
created: 2026-06-11T23:39:00Z
---

## Test Report: 024-international-phone-country-selector

### Summary

- **Tests**: 19/19 passed
- **Coverage**: não medido (foco em critérios de aceitação da story 009)

### Test Files

- [x] `apps/mobile/test/features/auth/phone_country_test.dart` — catálogo, máscaras BR/US/PT, busca por nome/DDI, escopo geográfico
- [x] `apps/mobile/test/features/auth/international_phone_field_test.dart` — layout alinhado, hint por país, formatação BR
- [x] `apps/mobile/test/features/auth/auth_phone_screens_test.dart` — copy da tela, botão Avançar, fluxo não-BR com mensagem amigável, controller unit
- [x] `apps/mobile/test/features/auth/brazil_phone_formatter_test.dart` — regressão E.164 BR (dependência do catálogo)

### Acceptance Criteria Validation

- ✅ **Seletor integrado alinhado ao campo**: `IntrinsicHeight` verificado em widget test
- ✅ **Dropdown com bandeira + nome + DDI**: bottom sheet com `ListTile` testado via fluxo Portugal
- ✅ **Catálogo Américas + PT + diáspora**: assert em `phone_country_test.dart`
- ✅ **Busca por nome ou DDI**: testes "port" e "351"
- ✅ **Brasil pré-selecionado**: default country + widget test
- ✅ **Máscara/placeholder por país**: BR, US, PT formatados; hint PT em widget test
- ✅ **BR + Avançar → Firebase SMS**: regressão via `brazil_phone_formatter_test` + botão habilitado com número completo
- ✅ **País ≠ BR → mensagem amigável, sem Firebase**: widget + unit test em `PhoneAuthController`
- ✅ **Acessibilidade**: `Semantics` implementados (validação manual recomendada TalkBack/VoiceOver)
- ✅ **Troca de país limpa dígitos**: implementado em `PhoneLoginPage._handleCountryChanged`

### Issues Found

Nenhum.

### Notes

- Teste de OTP permanece inalterado (fora do escopo deste bolt)
- Validação visual final contra mockup `public/telas/Captura de tela 2026-06-11 191536.png` recomendada em device/emulador
