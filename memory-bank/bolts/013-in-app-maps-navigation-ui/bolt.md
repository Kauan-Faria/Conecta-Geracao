---
id: 013-in-app-maps-navigation-ui
unit: 002-in-app-maps-navigation-ui
intent: 002-in-app-maps-navigation
type: simple-construction-bolt
status: complete
stories:
  - 001-maps-tab-shell
  - 002-flutter-map-base
created: 2026-06-08T20:00:00.000Z
started: 2026-06-09T00:33:00.000Z
completed: "2026-06-09T00:45:22Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-06-09T00:35:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-06-09T00:40:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-06-09T00:45:00.000Z
    artifact: test-walkthrough.md
requires_bolts: []
enables_bolts:
  - 014-in-app-maps-navigation-ui
requires_units:
  - 001-mobile-auth-shell
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 013-in-app-maps-navigation-ui

## Overview

Shell: nova aba Mapas + mapa base flutter_map com tiles OSM e atribuição.

## Objective

Usuário (incluindo guest) vê aba Mapas e mapa in-app carregando em < 3s.

## Stories Included

- **001-maps-tab-shell**: Aba Mapas no shell (Must)
- **002-flutter-map-base**: flutter_map + OSM tiles (Must)

## Bolt Type

**Type**: simple-construction-bolt

## Stages

- [x] **1. plan**: Complete → implementation-plan.md
- [x] **2. implement**: Complete → apps/mobile/lib/features/maps/
- [x] **3. test**: Complete → test-walkthrough.md

## Dependencies

### Requires
- 001-mobile-auth-shell (GoRouter shell)

### Enables
- 014-in-app-maps-navigation-ui

## Success Criteria

- [ ] Aba Mapas visível para guest e autenticado
- [ ] Mapa OSM renderiza com atribuição
- [ ] Widget tests básicos de navegação
