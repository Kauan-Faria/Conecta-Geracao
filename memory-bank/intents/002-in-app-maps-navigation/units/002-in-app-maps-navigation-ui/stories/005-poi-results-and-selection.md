---
id: 005-poi-results-and-selection
unit: 002-in-app-maps-navigation-ui
intent: 002-in-app-maps-navigation
status: complete
priority: must
created: 2026-06-08T20:00:00Z
assigned_bolt: 014-in-app-maps-navigation-ui
implemented: true
---

# Story: 005-poi-results-and-selection

## User Story

**As a** usuário que buscou um lugar
**I want** ver uma lista simples dos resultados mais próximos
**So that** escolha para onde ir

## Acceptance Criteria

- [ ] **Given** busca concluída, **When** há resultados, **Then** lista ordenada por distância com nome, endereço resumido e "a X metros/km"
- [ ] **Given** lista vazia, **When** zero POIs, **Then** mensagem "Não encontrei nenhum lugar por perto. Tente aumentar a distância."
- [ ] **Given** resultados, **When** toco um item, **Then** seleciono POI e avanço para rota no mapa
- [ ] **Given** lista, **When** leitor de tela ativo, **Then** cada item tem label semântico completo

## Technical Notes

- `MapsResultsPage` ou bottom sheet sobre mapa
- Chama `POST /maps/search`; loading state acessível

## Dependencies

### Requires
- 004-maps-search-screen
- 002-poi-category-queries (API)

### Enables
- 006-static-route-display

## Out of Scope

- Mapa com todos os pins simultâneos (Could — MVP lista primeiro)
