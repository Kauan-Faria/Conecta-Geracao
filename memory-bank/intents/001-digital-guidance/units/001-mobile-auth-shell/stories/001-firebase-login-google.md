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

## User Story

**As a** usuário digital
**I want** entrar no app com minha conta Google
**So that** minhas conversas fiquem salvas para mim

## Acceptance Criteria

- [ ] **Given** não estou logado, **When** toco em "Entrar com Google", **Then** completo login via Firebase e vejo a tela inicial
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

- Outros provedores de login no MVP
