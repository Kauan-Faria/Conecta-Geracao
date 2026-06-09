---
id: 002-flutter-map-base
unit: 002-in-app-maps-navigation-ui
intent: 002-in-app-maps-navigation
status: complete
priority: must
created: 2026-06-08T20:00:00Z
assigned_bolt: 013-in-app-maps-navigation-ui
implemented: true
---

# Story: 002-flutter-map-base

## User Story

**As a** usuário na aba Mapas
**I want** ver um mapa dentro do app
**So that** entenda onde estou e para onde ir

## Acceptance Criteria

- [ ] **Given** abro aba Mapas, **When** tela carrega, **Then** vejo mapa OpenStreetMap via flutter_map
- [ ] **Given** mapa visível, **When** observo rodapé, **Then** vejo atribuição "© OpenStreetMap contributors"
- [ ] **Given** mapa carregado, **When** uso pinça, **Then** amplio/reduzo o mapa
- [ ] **Given** mapa carregado, **When** aguardo, **Then** aparece em p95 < 3s

## Technical Notes

- Dependência: `flutter_map`, `latlong2`
- Tile URL OSM padrão; respeitar política de uso
- Widget reutilizável `OsmMapView`

## Dependencies

### Requires
- 001-maps-tab-shell

### Enables
- 006-static-route-display

## Out of Scope

- Marcadores e rota (story 006)
- GPS (story 003)
