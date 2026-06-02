---
id: 007-digital-guidance-ui
unit: 004-digital-guidance-ui
intent: 001-digital-guidance
type: simple-construction-bolt
status: planned
stories:
  - 003-conversation-history-list
  - 004-offline-conversation-cache
created: 2026-05-28T01:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []
requires_bolts:
  - 006-digital-guidance-ui
enables_bolts:
  - 008-digital-guidance-ui
requires_units: []
blocks: true
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 007-digital-guidance-ui

## Overview

Histórico de conversas e cache offline parcial.

## Objective

Usuário retoma conversas e lê histórico offline.

## Stories Included

- **003-conversation-history-list**: Lista de conversas (Should)
- **004-offline-conversation-cache**: Cache offline (Should)

## Dependencies

### Requires
- 006-digital-guidance-ui

### Enables
- 008-digital-guidance-ui

## Success Criteria

- [ ] Lista paginada de conversas
- [ ] Leitura offline de conversas cacheadas
