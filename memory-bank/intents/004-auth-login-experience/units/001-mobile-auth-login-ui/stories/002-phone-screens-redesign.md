---
id: 002-phone-screens-redesign
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
status: complete
priority: must
created: 2026-06-11T22:00:00.000Z
assigned_bolt: 022-auth-ui-foundation
implemented: true
---

# Story: 002-phone-screens-redesign

## User Story

**As a** usuário que prefere cadastrar com celular
**I want** telas de telefone e código iguais ao design aprovado
**So that** eu entenda claramente o que fazer em cada passo

## Acceptance Criteria

- [ ] **Given** toco "Fazer cadastro" na welcome, **When** abro telefone, **Then** vejo título "Vamos fazer seu cadastro" e instrução do mockup `191536`
- [ ] **Given** tela telefone, **When** visualizo campo, **Then** vejo seletor de país integrado e máscara conforme país (detalhes em story 009)
- [ ] **Given** número completo, **When** toco "Avançar", **Then** Firebase envia SMS e navego para OTP
- [ ] **Given** tela telefone, **When** toco "Se cadastrar de outra forma", **Then** navego para `/login/email`
- [ ] **Given** tela OTP, **When** abro, **Then** vejo "Vamos finalizar seu cadastro" e 6 caixas de dígito (mockup `191540`, adaptado para 6 dígitos Firebase)
- [ ] **Given** OTP, **When** SMS chega, **Then** autofill funciona (`AutofillHints.oneTimeCode`)
- [ ] **Given** OTP, **When** toco "Avançar" com código válido, **Then** autentico e sigo para onboarding/home
- [ ] **Given** OTP, **When** toco "Voltar e editar telefone", **Then** retorno à tela telefone com número preservado
- [ ] Lógica Firebase existente em `phone_auth_controller.dart` preservada

## Technical Notes

- Refatorar `PhoneLoginPage` e `PhoneOtpPage` para usar componentes da story 001
- Widget `OtpPinInput` com 6 caixas; foco automático entre campos
- Manter `BrazilPhoneFormatter` / E.164 para BR; seletor internacional na story 009
- Substituir textos "Entrar"/"Receber código" pelos do mockup

## Dependencies

### Requires
- 001-auth-shared-components

### Enables
- 007-auth-routing-integration
- 009-international-phone-country-selector

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Código incompleto | Botão Avançar desabilitado |
| Auto-verify (Android) | Redirect home como hoje |
| Reenvio SMS | Cooldown 60s mantido |

## Out of Scope

- Alteração do Firebase Phone Auth
- Cadastro por e-mail
