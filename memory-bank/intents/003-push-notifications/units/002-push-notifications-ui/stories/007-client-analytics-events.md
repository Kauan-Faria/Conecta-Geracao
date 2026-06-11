---
id: 007-client-analytics-events
unit: 002-push-notifications-ui
intent: 003-push-notifications
status: complete
priority: should
created: 2026-06-08T23:30:00.000Z
assigned_bolt: 020-push-notifications-ui
implemented: true
---

# Story: 007-client-analytics-events

## User Story

**As a** equipe de produto
**I want** eventos de analytics no app para o funil de notificações
**So that** meça permissão, registro, abertura e conversão

## Acceptance Criteria

- [ ] **Given** permissão concedida, **When** prompt aceito, **Then** emite `notification_permission_granted`
- [ ] **Given** permissão negada, **When** prompt recusado, **Then** emite `notification_permission_denied`
- [ ] **Given** token registrado, **When** API confirma, **Then** emite `notification_token_registered`
- [ ] **Given** usuário toca notificação, **When** deep link executado, **Then** emite `notification_opened` com type e route
- [ ] **Given** qualquer evento, **When** inspecionado, **Then** sem PII, token ou conteúdo de conversa

## Technical Notes

- Firebase Analytics `logEvent` ou logger estruturado
- Service centralizado: `NotificationAnalytics`
- Parâmetros: notification_type, route (enum/string)

## Dependencies

### Requires
- 002-contextual-permission-prompt
- 003-token-sync-logout
- 006-notification-deep-links

### Enables
- None (fecha funil com story 006 backend)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Analytics desabilitado | Eventos em debug log apenas |

## Out of Scope

- Dashboard
- notification_sent (backend story 006)
