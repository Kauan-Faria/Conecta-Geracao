---
intent: 002-in-app-maps-navigation
created: 2026-06-08T18:00:00Z
completed: 2026-06-08T20:00:00Z
status: complete
---

# Inception Log: in-app-maps-navigation

## Overview

**Intent**: Nova aba Mapas integrada ao chat — OSM + flutter_map, busca POI, rota estática.
**Type**: brown-field
**Created**: 2026-06-08

## Artifacts Created

| Artifact | Status | File |
|----------|--------|------|
| Requirements | complete | requirements.md |
| System Context | complete | system-context.md |
| Units | complete | units.md |
| Unit Briefs | complete | units/*/unit-brief.md |
| Stories | complete (12) | units/*/stories/*.md |
| Bolt Plan | complete (5 bolts) | memory-bank/bolts/011-015 |

## Summary

| Metric | Count |
|--------|-------|
| Functional Requirements | 8 |
| Non-Functional Requirements | 4 areas |
| Units | 2 |
| Stories | 12 |
| Bolts Planned | 5 |

## Units Breakdown

| Unit | Stories | Bolts | Priority |
|------|---------|-------|----------|
| 001-maps-services-api | 4 | 011, 012 | Must |
| 002-in-app-maps-navigation-ui | 8 | 013, 014, 015 | Must |

## Decision Log

| Date | Decision | Rationale | Approved |
|------|----------|-----------|----------|
| 2026-06-08 | OSM + flutter_map + Overpass + Nominatim + OSRM | Stack gratuita | Yes |
| 2026-06-08 | Raio padrão 5 km; opções 2/5/10 km | Flexibilidade com simplicidade | Yes |
| 2026-06-08 | Rota estática apenas no MVP | Começar simples | Yes |
| 2026-06-08 | Guest tem acesso; busca direta na aba | Inclusão e autonomia | Yes |
| 2026-06-08 | Fallback cidade/bairro se GPS negado | Acessibilidade | Yes |

## Ready for Construction

**Checklist**:
- [x] All requirements documented
- [x] System context defined
- [x] Units decomposed
- [x] Stories created for all units
- [x] Bolts planned
- [x] Human review complete

## Next Steps

1. Iniciar Construction com bolt 011:
   `/specsmd-construction-agent --unit="001-maps-services-api" --bolt-id="011-maps-services-api"`

## Dependencies

Ordem sugerida:
- 011-maps-services-api → 012-maps-services-api
- 013-in-app-maps-navigation-ui (paralelo) → 014 (requer 011) → 015 (requer 012 + 014)
