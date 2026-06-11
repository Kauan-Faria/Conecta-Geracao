---
id: 004-conversation-notification-triggers
unit: 001-notifications-api
intent: 003-push-notifications
status: complete
priority: must
created: 2026-06-08T23:30:00.000Z
assigned_bolt: 017-notifications-api
implemented: true
---

# Story: 004-conversation-notification-triggers

## User Story

**As a** usuário que abandonou uma conversa ou aguarda resposta da IA
**I want** receber notificação push relevante
**So that** retome a orientação sem perder o progresso

## Acceptance Criteria

- [ ] **Given** conversa sem atividade por 24h (configurável), **When** job executa, **Then** envia lembrete com corpo genérico e deep link para conversationId
- [ ] **Given** mesma conversa, **When** já enviou lembrete nas últimas 24h, **Then** não reenvia
- [ ] **Given** IA gera resposta e app em background, **When** trigger de resposta dispara, **Then** envia notificação "Sua orientação está pronta" com deep link
- [ ] **Given** preferência desativada, **When** trigger dispara, **Then** não envia

## Technical Notes

- Job `@Cron` ou scheduler para conversas abandonadas
- Hook no send-message use case ou evento domain quando resposta completa
- Integração com conversations module via port (evitar acoplamento direto)
- Default inactivity: 24h

## Dependencies

### Requires
- 003-fcm-push-provider
- 003-ai-assistant-api unit (conversations)

### Enables
- 006-notification-deep-links (UI — validação E2E)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Conversa já encerrada | Não enviar lembrete |
| Resposta enquanto app em foreground | Política: não enviar push (delegar ao app) |

## Out of Scope

- Dicas educativas (story 005)
- Conteúdo da resposta IA no payload
