---
id: 009-digital-guidance-ui
unit: 004-digital-guidance-ui
intent: 001-digital-guidance
type: simple-construction-bolt
status: planned
stories:
  - 006-home-screen
created: 2026-06-02T12:00:00.000Z
started: null
completed: null
current_stage: null
stages_completed: []
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

- [ ] Layout fiel ao mockup (header, hero, grid 2×2, recentes)
- [ ] "Quero ajuda agora" abre chat vazio
- [ ] 4 ações rápidas abrem chat com mensagem starter correta
- [ ] Verificações recentes e "Ver todas" funcionais
- [ ] Testes widget cobrindo navegação e mensagens starter
