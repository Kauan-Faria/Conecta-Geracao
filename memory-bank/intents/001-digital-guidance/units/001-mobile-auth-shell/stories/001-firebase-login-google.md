---
id: 001-firebase-login-google
unit: 001-mobile-auth-shell
intent: 001-digital-guidance
status: complete
priority: must
created: 2026-05-28T01:00:00.000Z
assigned_bolt: 001-mobile-auth-shell
implemented: true
---

# Story: 001-firebase-login-google

> **Nota (2026-06-02)**: Login Google permanece válido, mas passa a ser **caminho alternativo** (story `006-alternative-login-methods`). A tela principal de login é telefone + SMS (`004-phone-otp-primary-login`).

## User Story

**As a** usuário que prefere conta Google
**I want** entrar no app com minha conta Google na tela "Entrar de outra forma"
**So that** minhas conversas fiquem salvas sem usar SMS

## Acceptance Criteria

- [ ] **Given** estou na tela "Entrar de outra forma", **When** toco em "Entrar com Google", **Then** completo login via Firebase e vejo a tela inicial (ou onboarding de nome se aplicável)
- [ ] **Given** login falha, **When** retorno ao app, **Then** vejo mensagem simples em português explicando o erro
- [ ] **Given** estou logado, **When** reabro o app, **Then** permaneço autenticado sem novo login

## Technical Notes

- Firebase Auth SDK no Flutter; enviar ID token à API via `ApiClient`
- Sem perfil de cuidador

## Dependencies

### Requires
- None

### Enables
- 002-app-shell-navigation

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Usuário cancela Google sign-in | Volta à tela de login sem erro técnico |
| Sem internet no login | Mensagem "Precisa de internet para entrar" |

## Out of Scope

- Tela principal de login (telefone) — ver `004-phone-otp-primary-login`
- E-mail/senha — ver `006-alternative-login-methods`
