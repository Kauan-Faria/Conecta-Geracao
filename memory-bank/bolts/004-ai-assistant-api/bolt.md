---
id: 004-ai-assistant-api
unit: 003-ai-assistant-api
intent: 001-digital-guidance
type: ddd-construction-bolt
status: complete
stories:
  - 001-conversation-persistence
  - 005-chat-message-api
created: 2026-05-28T01:00:00Z
started: 2026-06-01T18:00:00Z
completed: 2026-06-01T20:00:00Z
current_stage: complete
stages_completed:
  - name: domain-model
    completed: 2026-06-01T18:00:00Z
    artifact: ddd-01-domain-model.md
  - name: technical-design
    completed: 2026-06-01T18:30:00Z
    artifact: ddd-02-technical-design.md
  - name: implementation
    completed: 2026-06-01T19:30:00Z
    artifact: apps/backend/src/modules/conversations
  - name: test-report
    completed: 2026-06-01T20:00:00Z
    artifact: ddd-03-test-report.md
requires_bolts:
  - 001-mobile-auth-shell
enables_bolts:
  - 005-ai-assistant-api
  - 006-digital-guidance-ui
requires_units:
  - 001-mobile-auth-shell
blocks: true
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 004-ai-assistant-api

## Overview

Persistência de conversas e endpoints REST de chat (sem LLM ainda — echo ou stub).

## Objective

API de conversas/mensagens autenticada e persistida.

## Stories Included

- **001-conversation-persistence**: Persistência de conversas (Must)
- **005-chat-message-api**: API REST de chat (Must)

## Dependencies

### Requires
- 001-mobile-auth-shell (Firebase guard)

### Enables
- 005-ai-assistant-api
- 006-digital-guidance-ui (integração básica)

## Success Criteria

- [x] CRUD conversas + POST message (stub OK neste bolt)
- [x] Auth Firebase validado
