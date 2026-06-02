---
id: 005-chat-message-api
unit: 003-ai-assistant-api
intent: 001-digital-guidance
status: draft
priority: must
created: 2026-05-28T01:00:00Z
assigned_bolt: 004-ai-assistant-api
implemented: false
---

# Story: 005-chat-message-api

## User Story

**As a** app mobile
**I want** enviar e receber mensagens via API REST
**So that** o usuário converse com o assistente

## Acceptance Criteria

- [ ] **Given** token Firebase válido, **When** POST `/api/v1/conversations/:id/messages` com `{ content }`, **Then** retorno mensagem assistant em envelope padrão
- [ ] **Given** token inválido, **When** chamo endpoint, **Then** retorno 401
- [ ] **Given** GET `/api/v1/conversations`, **When** autenticado, **Then** lista paginada das conversas do usuário
- [ ] **Given** POST `/api/v1/conversations`, **When** body opcional `{ topicSlug }`, **Then** nova conversa criada

## Technical Notes

- OpenAPI documentado; `X-Request-Id` propagado
- Rate limiting básico

## Dependencies

### Requires
- 001-conversation-persistence

### Enables
- 001-chat-screen
