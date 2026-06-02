---
id: 008-digital-guidance-ui
unit: 004-digital-guidance-ui
intent: 001-digital-guidance
type: simple-construction-bolt
status: complete
stories:
  - 002-topic-shortcuts
created: 2026-05-28T01:00:00.000Z
started: 2026-06-02T23:30:00.000Z
completed: "2026-06-02T22:29:32Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-06-02T23:35:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-06-02T23:50:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-06-02T23:55:00.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 006-digital-guidance-ui
enables_bolts: []
requires_units: []
blocks: true
complexity:
  avg_complexity: 1
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 008-digital-guidance-ui

## Overview

Atalhos visuais dos 6 tópicos MVP na tela inicial/chat.

## Objective

Reduzir barreira de entrada — usuário toca no assunto e inicia conversa.

## Stories Included

- **002-topic-shortcuts**: Atalhos dos 6 tópicos (Could)

## Dependencies

### Requires
- 006-digital-guidance-ui

## Success Criteria

- [x] 6 cards funcionais iniciando conversa com topicSlug
