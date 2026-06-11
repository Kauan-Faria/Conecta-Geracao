---
id: 006-email-verification-screen
unit: 001-mobile-auth-login-ui
intent: 004-auth-login-experience
status: complete
priority: must
created: 2026-06-11T22:00:00.000Z
assigned_bolt: 023-email-password-auth
implemented: true
---

# Story: 006-email-verification-screen

## User Story

**As a** usuário que acabou de se cadastrar com e-mail
**I want** uma tela clara me orientando a confirmar meu e-mail
**So that** eu complete o cadastro e possa usar o app com segurança

## Acceptance Criteria

- [ ] **Given** cadastro por e-mail bem-sucedido, **When** navego, **Then** vejo tela inspirada no mockup `191600.png`
- [ ] **Given** tela, **When** leio, **Then** título "Vamos finalizar seu cadastro" e texto explicando que enviamos e-mail com link de confirmação
- [ ] **Given** usuário abriu link no e-mail, **When** toca "Avançar", **Then** app recarrega usuário Firebase; se `emailVerified` → onboarding/home
- [ ] **Given** e-mail ainda não verificado, **When** toca "Avançar", **Then** mensagem "Ainda não confirmamos seu e-mail. Abra o link que enviamos."
- [ ] **Given** tela, **When** toco "Reenviar e-mail", **Then** `sendEmailVerification()` com cooldown 60s
- [ ] **Given** tela, **When** toco "Voltar e editar Email", **Then** retorno a `/login/email` em modo cadastro
- [ ] **Given** deep link Firebase configurado, **When** usuário clica link no e-mail, **Then** app retorna e pode auto-verificar (nice-to-have no bolt)
- [ ] UI usa componentes story 001

## Technical Notes

- Firebase **não** envia OTP de 4 dígitos por e-mail — usa link; copy adaptada mantendo layout visual do mockup
- Nova página `EmailVerificationPage`
- `firebaseUser.reload()` antes de checar `emailVerified`
- Opcional: ícone ilustrativo de e-mail no lugar das 4 caixas OTP (decisão visual no implement)

## Dependencies

### Requires
- 001-auth-shared-components
- 004-email-password-repository

### Enables
- 007-auth-routing-integration

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| E-mail na caixa de spam | Texto orienta verificar spam |
| Link expirado | Reenviar e-mail |
| Usuário fecha app antes de verificar | Ao reabrir logado mas não verificado → redirect para esta tela |

## Out of Scope

- OTP customizado de 4 dígitos via backend
- Verificação por SMS de e-mail
