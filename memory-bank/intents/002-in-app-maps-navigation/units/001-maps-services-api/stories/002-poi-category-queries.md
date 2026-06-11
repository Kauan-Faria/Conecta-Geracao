---
id: 002-poi-category-queries
unit: 001-maps-services-api
intent: 002-in-app-maps-navigation
status: complete
priority: must
created: 2026-06-08T20:00:00.000Z
assigned_bolt: 011-maps-services-api
implemented: true
updated: 2026-06-10T14:00:00.000Z
---

# Story: 002-poi-category-queries

## User Story

**As a** usuário buscando serviços essenciais
**I want** que o sistema entenda 6 categorias de lugares
**So that** encontre farmácias, saúde, bancos e outros comércios necessários

## Acceptance Criteria

- [ ] **Given** categoria `pharmacy`, **When** busco no raio, **Then** retorna farmácias via Google Places `type=pharmacy`
- [ ] **Given** categoria `health_post`, **When** busco, **Then** retorna UBS/postos de saúde (`type=doctor`)
- [ ] **Given** categoria `hospital`, **When** busco, **Then** retorna hospitais e UPAs
- [ ] **Given** categoria `bank`, **When** busco, **Then** retorna bancos e casas lotéricas
- [ ] **Given** categoria `post_office`, **When** busco, **Then** retorna agências dos Correios
- [ ] **Given** categoria `supermarket`, **When** busco, **Then** retorna supermercados
- [ ] **Given** raio 2/5/10 km, **When** informado, **Then** Places Nearby Search usa raio correto (default 5 km)

## Technical Notes

- Enum `PoiCategory` com mapeamento para Google Places `type` documentado em `PoiCategoryMapper`
- Resultados normalizados: `{ id, name, address, lat, lon, distanceMeters }` — campo `osmId` contém `place_id` Google (compatibilidade API)
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
| Nome ausente no Places | Usar endereço ou "Local sem nome" |

## Out of Scope

- Categorias além das 6 MVP
- Filtro por horário de funcionamento
