---
id: 001-osm-proxy-endpoints
unit: 001-maps-services-api
intent: 002-in-app-maps-navigation
status: complete
priority: must
created: 2026-06-08T20:00:00.000Z
assigned_bolt: 011-maps-services-api
implemented: true
updated: 2026-06-10T14:00:00.000Z
---

# Story: 001-osm-proxy-endpoints

> **Nota (2026-06-10)**: o slug do arquivo mantém o nome histórico; a implementação usa **Google Maps Platform** no backend (ADR-011). Tiles do mapa no Flutter continuam OSM.

## User Story

**As a** app mobile
**I want** endpoints REST que consultam Google Maps Platform via API
**So that** a chave fique no servidor e o app consuma contratos estáveis

## Acceptance Criteria

- [ ] **Given** coordenadas e categoria válidas, **When** `POST /maps/search`, **Then** retorna lista JSON de POIs via Places Nearby Search
- [ ] **Given** texto "Centro, Campinas", **When** `POST /maps/geocode`, **Then** retorna lat/lon via Geocoding API
- [ ] **Given** origem e destino, **When** `POST /maps/route`, **Then** retorna polyline, distância e duração via Directions API
- [ ] **Given** serviço Google indisponível, **When** proxy falha, **Then** retorna erro amigável (503) com mensagem para o app

## Technical Notes

- NestJS module `maps` em `apps/backend`; adapters `HttpGooglePlacesGateway`, `HttpGoogleGeocodingGateway`, `HttpGoogleDirectionsGateway`
- Chave `GOOGLEMAPS_API_KEY` somente no backend
- Cache TTL curto para geocode (reduzir quota Google — ADR-002)

## Dependencies

### Requires
- None (primeira story da unit)

### Enables
- 002-poi-category-queries
- 003-location-intent-chat

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Places timeout | 504 com mensagem "Busca demorou demais" |
| Geocoding sem resultados | 404 com mensagem "Lugar não encontrado" |
| Directions sem rota | 422 com fallback sugerido ao app |

## Out of Scope

- Mapeamento de categorias (story 002)
- Autenticação obrigatória no MVP (guest pode usar)
