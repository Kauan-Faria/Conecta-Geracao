---
id: 005-foreground-in-app-banner
unit: 002-push-notifications-ui
intent: 003-push-notifications
status: complete
priority: must
created: 2026-06-08T23:30:00.000Z
assigned_bolt: 020-push-notifications-ui
implemented: true
---

# Story: 005-foreground-in-app-banner

## User Story

**As a** usuário com app aberto
**I want** ver um banner simples quando chega notificação
**So that** saiba que há algo novo sem sair da tela atual

## Acceptance Criteria

- [ ] **Given** app em foreground, **When** FCM entrega notificação, **Then** exibe banner/SnackBar acessível com título e corpo genérico
- [ ] **Given** banner visível, **When** usuário toca, **Then** navega via deep link (mesma lógica story 006)
- [ ] **Given** banner visível, **When** usuário ignora, **Then** banner desaparece após timeout configurável
- [ ] **Given** contraste, **When** banner renderizado, **Then** atende WCAG AA conforme ux-guide.md

## Technical Notes

- `FirebaseMessaging.onMessage` listener
- Material Banner ou SnackBar com action "Ver"
- Opcional: flutter_local_notifications para consistência iOS

## Dependencies

### Requires
- 001-fcm-sdk-integration

### Enables
- 006-notification-deep-links

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Múltiplas notificações rápidas | Mostrar mais recente; não empilhar infinitamente |
| Usuário em tela de chat da mesma conversa | Pode suprimir banner (opcional no bolt) |

## Out of Scope

- Rich notifications com imagem
- Action buttons múltiplos
