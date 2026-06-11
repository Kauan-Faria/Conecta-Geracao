---
id: 006-notification-sent-analytics
unit: 001-notifications-api
intent: 003-push-notifications
status: complete
priority: must
created: 2026-06-08T23:30:00.000Z
assigned_bolt: 018-notifications-api
implemented: true
---

# Story: 006-notification-sent-analytics

## User Story

**As a** equipe de produto
**I want** registrar evento notification_sent no backend
**So that** meça o funil de entrega de notificações

## Acceptance Criteria

- [ ] **Given** push enviado com sucesso, **When** FCM confirma, **Then** emite evento `notification_sent` com type (reminder, ai_response, tip, campaign) e timestamp
- [ ] **Given** push skipped por preferência, **When** send abortado, **Then** não emite notification_sent
- [ ] **Given** evento emitido, **When** inspecionado, **Then** não contém PII, token FCM ou conteúdo de conversa

## Technical Notes

- Destino: structured logger + Firebase Analytics server-side (decidir no bolt)
- Integrar no SendPushNotificationUseCase após sucesso FCM

## Dependencies

### Requires
- 003-fcm-push-provider

### Enables
- 007-client-analytics-events (funil completo)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| FCM falha | Emitir notification_failed (opcional) sem PII |

## Out of Scope

- Dashboard de analytics
- Eventos client-side (story 007 UI)
