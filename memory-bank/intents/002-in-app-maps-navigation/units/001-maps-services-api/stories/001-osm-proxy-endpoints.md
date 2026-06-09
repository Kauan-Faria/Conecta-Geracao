---
id: 001-osm-proxy-endpoints
unit: 001-maps-services-api
intent: 002-in-app-maps-navigation
status: complete
priority: must
created: 2026-06-08T20:00:00.000Z
assigned_bolt: 011-maps-services-api
implemented: true
---

# Story: 001-osm-proxy-endpoints

## User Story

**As a** app mobile
**I want** endpoints REST que consultam Overpass, Nominatim e OSRM via API
**So that** respeite rate limits e centralize integrações OSM

## Acceptance Criteria

- [ ] **Given** coordenadas e categoria válidas, **When** `POST /maps/search`, **Then** retorna lista JSON de POIs do Overpass
- [ ] **Given** texto "Centro, Campinas", **When** `POST /maps/geocode`, **Then** retorna lat/lon via Nominatim
- [ ] **Given** origem e destino, **When** `POST /maps/route`, **Then** retorna polyline, distância e duração via OSRM
- [ ] **Given** serviço OSM indisponível, **When** proxy falha, **Then** retorna erro amigável (503) com mensagem para o app

## Technical Notes

- NestJS module `maps`; HttpModule com timeout configurável
- User-Agent: `ConectaGeracao/1.0 (contact@...)`
- Cache TTL curto para geocode (evitar hammer Nominatim)

## Dependencies

### Requires
- None (primeira story da unit)

### Enables
- 002-poi-category-queries
- 003-location-intent-chat

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Overpass timeout | 504 com mensagem "Busca demorou demais" |
| Nominatim sem resultados | 404 com mensagem "Lugar não encontrado" |
| OSRM sem rota | 422 com fallback sugerido ao app |

## Out of Scope

- Mapeamento de categorias (story 002)
- Autenticação obrigatória no MVP (guest pode usar)
