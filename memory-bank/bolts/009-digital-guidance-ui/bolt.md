---
id: 009-digital-guidance-ui
unit: 004-digital-guidance-ui
intent: 001-digital-guidance
type: simple-construction-bolt
status: complete
stories:
  - 006-home-screen
created: 2026-06-02T12:00:00.000Z
started: 2026-06-03T01:26:25.000Z
completed: "2026-06-03T01:39:28Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-06-03T01:32:39.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-06-03T01:38:55.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-06-03T01:38:55.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 006-digital-guidance-ui
  - 007-digital-guidance-ui
enables_bolts: []
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 009-digital-guidance-ui

## Overview

Implementar a tela inicial (Home) conforme mockup: hero CTA, ações rápidas com mensagem contextual pré-enviada e verificações recentes.

## Objective

Transformar a aba Início de placeholder em hub de entrada do assistente, reduzindo fricção para iniciar conversas guiadas.

## Stories Included

- **006-home-screen**: Tela inicial com CTA, ações rápidas e histórico resumido (Must)

## Dependencies

### Requires
- 006-digital-guidance-ui (chat + checkpoints)
- 007-digital-guidance-ui (lista de conversas + cache para recentes)

## Success Criteria

- [x] Layout fiel ao mockup (header, hero, grid 2×2, recentes)
- [x] "Quero ajuda agora" abre chat vazio
- [x] 6 atalhos MVP abrem chat com mensagem starter correta
- [x] Verificações recentes e "Ver todas" funcionais
- [x] Testes widget cobrindo navegação e mensagens starter
