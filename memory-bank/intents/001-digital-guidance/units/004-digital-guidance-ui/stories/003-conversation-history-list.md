---
id: 003-conversation-history-list
unit: 004-digital-guidance-ui
intent: 001-digital-guidance
status: complete
priority: should
created: 2026-05-28T01:00:00.000Z
assigned_bolt: 007-digital-guidance-ui
implemented: true
---

# Story: 003-conversation-history-list

## User Story

**As a** usuário
**I want** ver minhas conversas anteriores
**So that** retome uma dúvida que não terminei

## Acceptance Criteria

- [ ] **Given** tenho conversas salvas, **When** abro "Minhas conversas", **Then** vejo lista com data e título/tópico
- [ ] **Given** toco em conversa, **When** abro, **Then** histórico de mensagens carrega no chat
- [ ] **Given** lista grande, **When** rolo, **Then** paginação ou lazy load sem travar UI

## Technical Notes

- GET `/api/v1/conversations`; Riverpod provider

## Dependencies

### Requires
- 001-chat-screen

### Enables
- 004-offline-conversation-cache
