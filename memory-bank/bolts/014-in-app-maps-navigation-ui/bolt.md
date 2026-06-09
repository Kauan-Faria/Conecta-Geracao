---
id: 014-in-app-maps-navigation-ui
unit: 002-in-app-maps-navigation-ui
intent: 002-in-app-maps-navigation
type: simple-construction-bolt
status: complete
stories:
  - 003-location-permission-fallback
  - 004-maps-search-screen
  - 005-poi-results-and-selection
created: 2026-06-08T20:00:00.000Z
started: 2026-06-09T00:49:09.000Z
completed: "2026-06-09T01:02:21Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-06-09T00:52:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-06-09T00:59:02.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-06-09T01:00:02.000Z
    artifact: test-walkthrough.md
requires_bolts:
  - 011-maps-services-api
  - 013-in-app-maps-navigation-ui
enables_bolts:
  - 015-in-app-maps-navigation-ui
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 3
---

# Bolt: 014-in-app-maps-navigation-ui

## Overview

Fluxo completo de busca: GPS ou bairro, 6 categorias, raio 2/5/10 km, lista de resultados.

## Objective

Usuário busca farmácia em 5 km pela aba Mapas e escolhe um resultado.

## Stories Included

- **003-location-permission-fallback**: GPS ou cidade/bairro (Must)
- **004-maps-search-screen**: Tela de busca direta (Must)
- **005-poi-results-and-selection**: Lista POIs (Must)

## Bolt Type

**Type**: simple-construction-bolt

## Stages

- [x] **1. plan**: Complete → implementation-plan.md
- [x] **2. implement**: Complete → apps/mobile/lib/features/maps/
- [x] **3. test**: Complete → test-walkthrough.md

## Dependencies

### Requires
- 011-maps-services-api (API search/geocode)
- 013-in-app-maps-navigation-ui (aba + mapa base)

### Enables
- 015-in-app-maps-navigation-ui

## Success Criteria

- [x] Busca com GPS funciona end-to-end
- [x] Fallback bairro/cidade funciona
- [x] Lista vazia exibe mensagem amigável
