---
id: 006-digital-guidance-ui
unit: 004-digital-guidance-ui
intent: 001-digital-guidance
type: simple-construction-bolt
status: planned
stories:
  - 001-chat-screen
  - 005-checkpoint-user-responses
created: 2026-05-28T01:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []
requires_bolts:
  - 001-mobile-auth-shell
  - 005-ai-assistant-api
enables_bolts:
  - 007-digital-guidance-ui
  - 008-digital-guidance-ui
requires_units:
  - 001-mobile-auth-shell
  - 003-ai-assistant-api
blocks: true
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 3
  testing_scope: 3
---

# Bolt: 006-digital-guidance-ui

## Overview

Tela de chat acessível com UI de checkpoints (Sim/Não).

## Objective

Usuário conversa com IA e responde checkpoints de forma simples.

## Stories Included

- **001-chat-screen**: Tela de chat acessível (Must)
- **005-checkpoint-user-responses**: UI de checkpoints (Must)

## Dependencies

### Requires
- 001-mobile-auth-shell
- 005-ai-assistant-api (IA completa)

### Enables
- 007-digital-guidance-ui
- 008-digital-guidance-ui

## Success Criteria

- [ ] Chat end-to-end com IA nos 6 tópicos
- [ ] Botões Sim/Não acessíveis
