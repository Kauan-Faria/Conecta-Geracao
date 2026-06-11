---
id: 002-contextual-permission-prompt
unit: 002-push-notifications-ui
intent: 003-push-notifications
status: complete
priority: must
created: 2026-06-08T23:30:00.000Z
assigned_bolt: 019-push-notifications-ui
implemented: true
---

# Story: 002-contextual-permission-prompt

## User Story

**As a** usuário autenticado
**I want** ser convidado a ativar notificações após perceber valor no app
**So that** entenda por que notificações me ajudam sem ser interrompido na primeira abertura

## Acceptance Criteria

- [ ] **Given** primeira abertura do app, **When** usuário navega, **Then** nenhum prompt de notificação é exibido
- [ ] **Given** usuário completou interação significativa no chat (ex.: primeira resposta útil), **When** condição contextual atingida, **Then** exibe diálogo explicativo em linguagem simples
- [ ] **Given** usuário aceita, **When** confirma, **Then** solicita permissão OS e emite `notification_permission_granted`
- [ ] **Given** usuário nega, **When** recusa, **Then** emite `notification_permission_denied` e app continua normal
- [ ] **Given** usuário já negou antes, **When** contexto futuro, **Then** pode oferecer novamente sem spam (máx. 1x por sessão)

## Technical Notes

- Trigger contextual: após primeira mensagem respondida pela IA ou flag em SharedPreferences
- Diálogo customizado antes do prompt nativo (pre-permission)
- Textos curtos conforme ux-guide.md

## Dependencies

### Requires
- 001-fcm-sdk-integration

### Enables
- 003-token-sync-logout

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Permissão já concedida no OS | Pular diálogo; ir direto ao registro token |
| iOS provisional authorization | Tratar conforme política do bolt |

## Out of Scope

- Categorias de notificação
- Permissão na onboarding inicial
