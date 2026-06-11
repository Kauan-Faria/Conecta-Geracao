---
id: 015-in-app-maps-navigation-ui
unit: 002-in-app-maps-navigation-ui
intent: 002-in-app-maps-navigation
type: simple-construction-bolt
status: complete
stories:
  - 006-static-route-display
  - 007-chat-to-maps-handoff
  - 008-maps-ai-assist
created: 2026-06-08T20:00:00.000Z
started: 2026-06-09T00:05:09.000Z
completed: "2026-06-09T00:26:22Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-06-09T00:09:52.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-06-09T00:15:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-06-09T00:20:01.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 012-maps-services-api
  - 014-in-app-maps-navigation-ui
enables_bolts: []
requires_units:
  - 004-digital-guidance-ui
blocks: false
complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 3
  testing_scope: 3
---

# Bolt: 015-in-app-maps-navigation-ui

## Overview

Rota estática no mapa, handoff chat→Mapas e botão de ajuda da IA na aba.

## Objective

Fluxo completo: chat "farmácia perto" → Mapas com rota; busca na aba com ajuda IA.

## Stories Included

- **006-static-route-display**: Polyline Directions no mapa (Must)
- **007-chat-to-maps-handoff**: Redirecionamento do chat (Must)
- **008-maps-ai-assist**: Pedir ajuda à IA (Should)

## Bolt Type

**Type**: simple-construction-bolt

## Stages

- [x] **1. plan**: Complete → implementation-plan.md
- [x] **2. implement**: Complete → apps/mobile/lib/features/maps/ + chat integration
- [x] **3. test**: Complete → test-walkthrough.md

## Dependencies

### Requires
- 012-maps-services-api (map_action no chat)
- 014-in-app-maps-navigation-ui (busca + resultados)
- 004-digital-guidance-ui (ChatPage)

### Enables
- Intent 002 MVP completo

## Success Criteria

- [x] Rota estática visível entre origem e POI
- [x] Chat com pergunta geográfica abre Mapas
- [x] "Pedir ajuda à IA" abre chat contextualizado
