---
id: 003-token-sync-logout
unit: 002-push-notifications-ui
intent: 003-push-notifications
status: complete
priority: must
created: 2026-06-08T23:30:00.000Z
assigned_bolt: 019-push-notifications-ui
implemented: true
---

# Story: 003-token-sync-logout

## User Story

**As a** usuário autenticado com permissão concedida
**I want** que meu token FCM seja registrado no backend e removido no logout
**So that** receba notificações apenas na minha conta ativa

## Acceptance Criteria

- [ ] **Given** permissão concedida e usuário logado, **When** token FCM obtido, **Then** envia `PUT /notifications/device-token` com Bearer token
- [ ] **Given** registro bem-sucedido, **When** API responde 200, **Then** emite `notification_token_registered`
- [ ] **Given** token refresh, **When** FCM renova token, **Then** re-sincroniza com backend automaticamente
- [ ] **Given** logout, **When** usuário sai, **Then** chama endpoint de inativação de token antes de limpar sessão
- [ ] **Given** usuário convidado (guest), **When** qualquer fluxo, **Then** não registra token

## Technical Notes

- Repository Flutter para notifications API
- Integrar no fluxo de logout existente (firebase_auth_repository)
- Retry com backoff em falha de rede

## Dependencies

### Requires
- 001-fcm-sdk-integration
- 002-contextual-permission-prompt
- 002-token-preference-api (backend)
- 016-notifications-api bolt

### Enables
- 004-notification-settings-toggle

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Offline no registro | Enfileirar retry na próxima conexão |
| 401 no registro | Não registrar; aguardar re-login |

## Out of Scope

- Múltiplas contas no mesmo dispositivo simultâneo
