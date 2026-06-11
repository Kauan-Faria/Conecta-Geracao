---
id: 001-notifications-domain-model
unit: 001-notifications-api
intent: 003-push-notifications
status: complete
priority: must
created: 2026-06-08T23:30:00Z
assigned_bolt: 016-notifications-api
implemented: true
---

# Story: 001-notifications-domain-model

## User Story

**As a** desenvolvedor backend
**I want** o domínio de notificações com DeviceToken, NotificationPreference e PushNotificationProvider
**So that** a arquitetura fique modular e preparada para evolução

## Acceptance Criteria

- [ ] **Given** o módulo NotificationsModule, **When** inicializado, **Then** expõe portas DeviceTokenRepository, NotificationPreferenceRepository e PushNotificationProvider
- [ ] **Given** entidade DeviceToken, **When** criada, **Then** valida firebaseUid, token não vazio e platform (ios/android)
- [ ] **Given** entidade NotificationPreference, **When** criada, **Then** default enabled=true para novos usuários autenticados
- [ ] **Given** value object PushNotification, **When** montado, **Then** rejeita payload com campos sensíveis ou conteúdo pessoal completo

## Technical Notes

- Estrutura DDD: domain/entities, domain/value-objects, application/ports
- Prisma schema: `DeviceToken`, `NotificationPreference`
- PushNotificationProvider como interface; implementação FCM na story 003

## Dependencies

### Requires
- None (primeira story da unit)

### Enables
- 002-token-preference-api
- 003-fcm-push-provider

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Token duplicado mesmo dispositivo | Upsert por firebaseUid + token |
| Usuário sem preferência | Criar default enabled=true no primeiro registro |

## Out of Scope

- Envio FCM real
- Jobs de lembrete
