---
id: 001-conversation-persistence
unit: 003-ai-assistant-api
intent: 001-digital-guidance
status: draft
priority: must
created: 2026-05-28T01:00:00Z
assigned_bolt: 004-ai-assistant-api
implemented: false
---

# Story: 001-conversation-persistence

## User Story

**As a** usuário logado
**I want** que minhas conversas sejam salvas
**So that** possa retomar de onde parei

## Acceptance Criteria

- [ ] **Given** usuário autenticado, **When** crio conversa, **Then** registro vinculado ao `firebase_uid`
- [ ] **Given** conversa existente, **When** envio mensagem, **Then** mensagem persistida com role (user/assistant) e timestamp ISO
- [ ] **Given** conversa, **When** consulto status, **Then** pode ser `in_progress` ou `completed`

## Technical Notes

- Prisma models Conversation, Message
- Sem armazenar conteúdo classificado como sensível (guardrails)

## Dependencies

### Requires
- 001-mobile-auth-shell (auth pattern)

### Enables
- 005-chat-message-api
