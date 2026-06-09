---
id: 006-static-route-display
unit: 002-in-app-maps-navigation-ui
intent: 002-in-app-maps-navigation
status: complete
priority: must
created: 2026-06-08T20:00:00Z
assigned_bolt: 015-in-app-maps-navigation-ui
implemented: true
---

# Story: 006-static-route-display

## User Story

**As a** usuário que escolheu um lugar
**I want** ver no mapa o caminho até lá
**So that** saiba como chegar

## Acceptance Criteria

- [ ] **Given** POI selecionado, **When** rota carrega, **Then** mapa exibe marcador origem (eu) e destino (lugar)
- [ ] **Given** rota disponível, **When** OSRM responde, **Then** linha (polyline) conecta origem e destino
- [ ] **Given** rota exibida, **When** leio texto abaixo, **Then** vejo distância e tempo em linguagem simples (ex.: "cerca de 1,2 km — 15 min a pé")
- [ ] **Given** OSRM falha, **When** erro, **Then** mensagem amigável + opção "Tentar de novo" (sem crash)
- [ ] **Given** rota visível, **When** toco "Centralizar", **Then** mapa enquadra origem e destino (botão ≥ 48dp)

## Technical Notes

- Decodificar polyline OSRM; layer `PolylineLayer` no flutter_map
- Chama `POST /maps/route`
- Sem turn-by-turn no MVP

## Dependencies

### Requires
- 005-poi-results-and-selection
- 001-osm-proxy-endpoints (API route)

### Enables
- None

## Out of Scope

- Navegação passo a passo
- Modo carro vs a pé (OSRM default foot/car — definir na Construction)
