---
id: 012-maps-services-api
unit: 001-maps-services-api
intent: 002-in-app-maps-navigation
type: ddd-construction-bolt
status: complete
stories:
  - 003-location-intent-chat
  - 004-radius-suggestion-response
created: 2026-06-08T20:00:00.000Z
started: 2026-06-08T23:45:00.000Z
completed: "2026-06-09T00:00:49Z"
current_stage: null
stages_completed:
  - name: model
    completed: 2026-06-08T23:55:00.000Z
    artifact: ddd-01-domain-model.md
  - name: design
    completed: 2026-06-09T00:00:00.000Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-06-09T00:05:00.000Z
    artifact: adr-004-map-action-via-message-metadata.md, adr-005-conversations-decoupled-from-maps-module.md
  - name: implement
    completed: 2026-06-09T00:30:00.000Z
    artifact: apps/backend/src/modules/conversations/
  - name: test
    completed: 2026-06-09T00:45:00.000Z
    artifact: ddd-03-test-report.md
requires_bolts:
  - 011-maps-services-api
enables_bolts:
  - 015-in-app-maps-navigation-ui
requires_units:
  - 003-ai-assistant-api
blocks: false
complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 3
  testing_scope: 2
---

# Bolt: 012-maps-services-api

## Overview

Extensão do assistente IA: detecção de intenção geográfica no chat, payload `map_action` e sugestão de raio 2/5/10 km.

## Objective

Usuário pergunta "farmácia mais próxima" no chat e recebe resposta estruturada para abrir Mapas.

## Stories Included

- **003-location-intent-chat**: Detecção intenção + map_action (Must)
- **004-radius-suggestion-response**: Sugestão raio 2/5/10 km (Should)

## Bolt Type

**Type**: ddd-construction-bolt

## Stages

- [x] **1. model**: Complete → ddd-01-domain-model.md
- [x] **2. design**: Complete → ddd-02-technical-design.md
- [x] **3. adr-analysis**: Complete → 2 ADRs criados
- [x] **4. implement**: Complete → extensão conversations + tool LLM
- [x] **5. test**: Complete → ddd-03-test-report.md

## Dependencies

### Requires
- 011-maps-services-api (endpoints POI)
- 003-ai-assistant-api unit (intent 001) — orquestração LLM existente

### Enables
- 015-in-app-maps-navigation-ui (chat handoff)

## Success Criteria

- [x] Chat retorna map_action para perguntas geográficas
- [x] Perguntas não geográficas não emitem map_action
- [x] Raio default 5 km; sugestões 2/10 km documentadas no prompt
