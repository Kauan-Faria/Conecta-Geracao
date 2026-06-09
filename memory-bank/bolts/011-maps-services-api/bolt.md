---
id: 011-maps-services-api
unit: 001-maps-services-api
intent: 002-in-app-maps-navigation
type: ddd-construction-bolt
status: complete
stories:
  - 001-osm-proxy-endpoints
  - 002-poi-category-queries
created: 2026-06-08T20:00:00.000Z
started: 2026-06-08T23:00:25.000Z
completed: "2026-06-08T23:36:06Z"
current_stage: null
stages_completed:
  - name: model
    completed: 2026-06-08T23:01:12.000Z
    artifact: ddd-01-domain-model.md
  - name: design
    completed: 2026-06-08T23:01:56.000Z
    artifact: ddd-02-technical-design.md
  - name: adr-analysis
    completed: 2026-06-08T23:07:16.000Z
    artifact: adr-001-public-maps-endpoints.md, adr-002-in-memory-geocode-cache.md, adr-003-public-osm-stack.md
  - name: implement
    completed: 2026-06-08T23:33:00.000Z
    artifact: apps/backend/src/modules/maps/
  - name: test
    completed: 2026-06-08T23:34:27.000Z
    artifact: ddd-03-test-report.md
requires_bolts: []
enables_bolts:
  - 012-maps-services-api
  - 014-in-app-maps-navigation-ui
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: 011-maps-services-api

## Overview

Fundação backend: proxy OSM (Overpass, Nominatim, OSRM) e mapeamento das 6 categorias POI MVP.

## Objective

API NestJS expõe busca de lugares, geocoding e rota estática com stack gratuita OpenStreetMap.

## Stories Included

- **001-osm-proxy-endpoints**: Proxy Overpass/Nominatim/OSRM (Must)
- **002-poi-category-queries**: 6 categorias + raio 2/5/10 km (Must)

## Bolt Type

**Type**: ddd-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/ddd-construction-bolt.md`

## Stages

- [x] **1. model**: Complete → ddd-01-domain-model.md
- [x] **2. design**: Complete → ddd-02-technical-design.md
- [x] **3. adr-analysis**: Complete → 3 ADRs criados
- [x] **4. implement**: Complete → apps/backend/src/modules/maps/
- [x] **5. test**: Complete → ddd-03-test-report.md

## Dependencies

### Requires
- None (primeiro bolt da intent)

### Enables
- 012-maps-services-api
- 014-in-app-maps-navigation-ui (endpoints POI/geocode/route)

## Success Criteria

- [ ] Endpoints /maps/search, /maps/geocode, /maps/route funcionais
- [ ] 6 categorias retornam resultados em área de teste
- [ ] Testes com mocks Overpass/OSRM passando
