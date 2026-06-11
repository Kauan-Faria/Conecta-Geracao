---
id: 006-notification-deep-links
unit: 002-push-notifications-ui
intent: 003-push-notifications
status: complete
priority: must
created: 2026-06-08T23:30:00.000Z
assigned_bolt: 020-push-notifications-ui
implemented: true
---

# Story: 006-notification-deep-links

## User Story

**As a** usuário
**I want** que ao tocar na notificação o app abra a tela correta
**So that** retome conversa ou acesse conteúdo relevante rapidamente

## Acceptance Criteria

- [ ] **Given** payload com route=chat e conversationId, **When** usuário toca notificação, **Then** abre tela de chat da conversa
- [ ] **Given** payload com route=home, **When** toque, **Then** abre tela inicial
- [ ] **Given** payload com route=maps, **When** toque, **Then** abre aba Mapas
- [ ] **Given** cold start via notificação, **When** app inicia, **Then** navega após auth check sem perder deep link
- [ ] **Given** route inválido, **When** toque, **Then** abre home com mensagem amigável
- [ ] **Given** navegação bem-sucedida, **When** tela aberta, **Then** emite `notification_opened` com type e route

## Technical Notes

- Parser centralizado: `NotificationDeepLinkHandler`
- Integrar com GoRouter/Navigator existente
- Payload data keys: type, route, conversationId, topicId?

## Dependencies

### Requires
- 001-fcm-sdk-integration
- 004-digital-guidance-ui (rotas chat)
- 004-conversation-notification-triggers (backend envia payload)

### Enables
- 007-client-analytics-events

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| conversationId inexistente | Home + "Conversa não encontrada" |
| Usuário não autenticado | Login primeiro; depois deep link |

## Out of Scope

- Universal links externos
- Deep links para web
