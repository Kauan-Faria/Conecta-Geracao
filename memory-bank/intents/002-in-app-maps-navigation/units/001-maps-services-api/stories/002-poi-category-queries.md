---
id: 002-poi-category-queries
unit: 001-maps-services-api
intent: 002-in-app-maps-navigation
status: complete
priority: must
created: 2026-06-08T20:00:00.000Z
assigned_bolt: 011-maps-services-api
implemented: true
---

# Story: 002-poi-category-queries

## User Story

**As a** usuário buscando serviços essenciais
**I want** que o sistema entenda 6 categorias de lugares
**So that** encontre farmácias, saúde, bancos e outros comércios necessários

## Acceptance Criteria

- [ ] **Given** categoria `pharmacy`, **When** busco no raio, **Then** retorna farmácias OSM (`amenity=pharmacy` ou equivalente)
- [ ] **Given** categoria `health_post`, **When** busco, **Then** retorna UBS/postos de saúde
- [ ] **Given** categoria `hospital`, **When** busco, **Then** retorna hospitais e UPAs
- [ ] **Given** categoria `bank`, **When** busco, **Then** retorna bancos e casas lotéricas
- [ ] **Given** categoria `post_office`, **When** busco, **Then** retorna agências dos Correios
- [ ] **Given** categoria `supermarket`, **When** busco, **Then** retorna supermercados
- [ ] **Given** raio 2/5/10 km, **When** informado, **Then** query Overpass usa raio correto (default 5 km)

## Technical Notes

- Enum `PoiCategory` com mapeamento para queries Overpass documentado
- Resultados normalizados: `{ id, name, address, lat, lon, distanceMeters }`
- Ordenação por distância no backend

## Dependencies

### Requires
- 001-osm-proxy-endpoints

### Enables
- 003-location-intent-chat
- 005-poi-results-and-selection (UI)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Categoria inválida | 400 validation error |
| Zero resultados | 200 com array vazio |
| Nome OSM ausente | Usar endereço ou "Local sem nome" |

## Out of Scope

- Categorias além das 6 MVP
- Filtro por horário de funcionamento
