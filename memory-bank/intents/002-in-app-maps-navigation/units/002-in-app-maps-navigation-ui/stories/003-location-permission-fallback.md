---
id: 003-location-permission-fallback
unit: 002-in-app-maps-navigation-ui
intent: 002-in-app-maps-navigation
status: complete
priority: must
created: 2026-06-08T20:00:00Z
assigned_bolt: 014-in-app-maps-navigation-ui
implemented: true
---

# Story: 003-location-permission-fallback

## User Story

**As a** usuário que precisa buscar lugares
**I want** usar minha localização ou informar bairro/cidade
**So that** encontre resultados mesmo sem GPS

## Acceptance Criteria

- [ ] **Given** primeira busca, **When** app precisa de local, **Then** diálogo explica em linguagem simples por que pede localização
- [ ] **Given** permissão concedida, **When** busco, **Then** usa coordenadas GPS atuais
- [ ] **Given** permissão negada, **When** busco, **Then** pergunta "Em qual bairro ou cidade?" com campo de texto grande
- [ ] **Given** informo "Centro, Campinas", **When** confirmo, **Then** app geocodifica via API e usa como centro
- [ ] **Given** geocodificação falha, **When** erro, **Then** mensagem "Não encontrei esse lugar. Tente outro bairro."

## Technical Notes

- `geolocator` para permissão; `permission_handler` se necessário
- `LocationController` Riverpod; chama `POST /maps/geocode`

## Dependencies

### Requires
- 001-osm-proxy-endpoints (API)
- 002-flutter-map-base

### Enables
- 004-maps-search-screen
- 005-poi-results-and-selection

## Out of Scope

- Salvar última cidade informada entre sessões (Could futuro)
