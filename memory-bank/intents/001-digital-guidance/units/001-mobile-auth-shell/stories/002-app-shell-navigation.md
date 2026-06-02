---
id: 002-app-shell-navigation
unit: 001-mobile-auth-shell
intent: 001-digital-guidance
status: complete
priority: must
created: 2026-05-28T01:00:00.000Z
assigned_bolt: 001-mobile-auth-shell
implemented: true
---

# Story: 002-app-shell-navigation

## User Story

**As a** usuário logado
**I want** navegar entre as áreas principais do app
**So that** encontre o assistente e minhas configurações facilmente

## Acceptance Criteria

- [ ] **Given** estou logado, **When** abro o app, **Then** vejo navegação para Início/Chat e Configurações
- [ ] **Given** estou em qualquer tela, **When** uso o menu, **Then** alvos de toque ≥ 48dp com rótulo textual
- [ ] **Given** não estou logado, **When** abro o app, **Then** sou direcionado ao login

## Technical Notes

- Riverpod para estado de auth; GoRouter ou Navigator 2.0
- Portrait only (MVP)

## Dependencies

### Requires
- 001-firebase-login-google

### Enables
- 004-digital-guidance-ui stories

## Out of Scope

- Tablet layout dedicado
