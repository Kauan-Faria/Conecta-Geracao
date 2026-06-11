---
id: 003-fcm-push-provider
unit: 001-notifications-api
intent: 003-push-notifications
status: complete
priority: must
created: 2026-06-08T23:30:00.000Z
assigned_bolt: 017-notifications-api
implemented: true
---

# Story: 003-fcm-push-provider

## User Story

**As a** sistema backend
**I want** enviar push notifications via FCM Admin SDK
**So that** usuários recebam notificações de forma confiável e segura

## Acceptance Criteria

- [ ] **Given** PushNotificationProvider implementado, **When** send() chamado com usuário elegível, **Then** envia via FCM HTTP v1 com título, corpo genérico e data payload (route, type, conversationId?)
- [ ] **Given** NotificationPreference.enabled=false, **When** send() chamado, **Then** não envia e retorna skipped
- [ ] **Given** token FCM inválido/expirado, **When** FCM retorna erro permanente, **Then** marca DeviceToken isActive=false
- [ ] **Given** payload com campo sensível, **When** validação de domínio, **Then** rejeita antes do envio

## Technical Notes

- Implementação: `FcmPushNotificationProvider` usando `firebase-admin` messaging
- Payload data: `{ type, route, conversationId? }` — sem conteúdo de conversa
- Use case: `SendPushNotificationUseCase`

## Dependencies

### Requires
- 001-notifications-domain-model
- 002-token-preference-api

### Enables
- 004-conversation-notification-triggers
- 005-tips-and-campaigns

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Usuário sem token ativo | Log warning; não falha job |
| FCM rate limit | Retry com backoff |

## Out of Scope

- Lógica de quando disparar (triggers)
- Analytics notification_sent (story 006)
