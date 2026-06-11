---
id: 002-token-preference-api
unit: 001-notifications-api
intent: 003-push-notifications
status: complete
priority: must
created: 2026-06-08T23:30:00Z
assigned_bolt: 016-notifications-api
implemented: true
---

# Story: 002-token-preference-api

## User Story

**As a** app mobile autenticado
**I want** registrar meu token FCM e minha preferência de notificações via API
**So that** o backend saiba onde e se deve enviar push

## Acceptance Criteria

- [ ] **Given** usuário autenticado, **When** `PUT /notifications/device-token` com token válido, **Then** persiste DeviceToken vinculado ao firebaseUid
- [ ] **Given** token já existente, **When** re-registro, **Then** atualiza lastSeenAt e mantém isActive=true
- [ ] **Given** usuário autenticado, **When** `PUT /notifications/preferences` com enabled=false, **Then** persiste preferência desativada
- [ ] **Given** logout, **When** `DELETE /notifications/device-token` ou evento equivalente, **Then** marca token isActive=false
- [ ] **Given** requisição sem auth, **When** qualquer endpoint, **Then** retorna 401

## Technical Notes

- Firebase Auth guard obrigatório
- firebaseUid extraído do token JWT
- Respostas JSON consistentes com padrão API existente

## Dependencies

### Requires
- 001-notifications-domain-model

### Enables
- 003-fcm-push-provider
- 003-token-sync-logout (UI)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Múltiplos dispositivos | Suportar N tokens ativos por firebaseUid |
| Token vazio | 400 validation error |

## Out of Scope

- Envio de notificações
- Convidados (guest)
