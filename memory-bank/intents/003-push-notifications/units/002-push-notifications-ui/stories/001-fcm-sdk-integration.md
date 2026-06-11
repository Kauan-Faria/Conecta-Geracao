---
id: 001-fcm-sdk-integration
unit: 002-push-notifications-ui
intent: 003-push-notifications
status: complete
priority: must
created: 2026-06-08T23:30:00.000Z
assigned_bolt: 019-push-notifications-ui
implemented: true
---

# Story: 001-fcm-sdk-integration

## User Story

**As a** app mobile
**I want** integrar firebase_messaging com handlers de background
**So that** receba notificações push do FCM

## Acceptance Criteria

- [ ] **Given** app inicializado, **When** firebase_messaging configurado, **Then** obtém token FCM sem crash em iOS e Android
- [ ] **Given** notificação em background, **When** FCM entrega, **Then** handler processa payload data
- [ ] **Given** app terminado (cold start), **When** usuário abre via notificação, **Then** initialMessage capturado
- [ ] **Given** erro de token, **When** falha, **Then** app continua funcional (degradação graciosa)

## Technical Notes

- Adicionar `firebase_messaging` ao pubspec
- Configurar APNs no iOS (Firebase console)
- Background handler top-level function
- Reutilizar `firebase_options.dart` existente

## Dependencies

### Requires
- 001-mobile-auth-shell (Firebase core)

### Enables
- 002-contextual-permission-prompt
- 003-token-sync-logout

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Dispositivo sem Google Play Services | Mensagem amigável; sem push |
| Token refresh | Listener onTokenRefresh |

## Out of Scope

- Permissão contextual (story 002)
- Banner foreground (story 005)
