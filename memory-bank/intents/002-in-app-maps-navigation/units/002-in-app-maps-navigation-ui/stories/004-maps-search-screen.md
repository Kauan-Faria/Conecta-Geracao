---
id: 004-maps-search-screen
unit: 002-in-app-maps-navigation-ui
intent: 002-in-app-maps-navigation
status: complete
priority: must
created: 2026-06-08T20:00:00Z
assigned_bolt: 014-in-app-maps-navigation-ui
implemented: true
---

# Story: 004-maps-search-screen

## User Story

**As a** usuário na aba Mapas
**I want** escolher o tipo de lugar e distância de busca
**So that** encontre o que preciso sem usar o chat

## Acceptance Criteria

- [ ] **Given** abro Mapas, **When** vejo tela de busca, **Then** há 6 botões de categoria com ícone + rótulo: Farmácia, UBS, Hospital/UPA, Banco/Lotérica, Correios, Supermercado
- [ ] **Given** seleciono categoria, **When** escolho distância, **Then** opções 2 km, 5 km (padrão), 10 km com rótulos acessíveis
- [ ] **Given** categoria e raio definidos, **When** toco "Buscar", **Then** dispara busca POI com localização (GPS ou bairro)
- [ ] **Given** tela de busca, **When** vejo rodapé, **Then** há botão "Pedir ajuda à IA" (≥ 48dp)

## Technical Notes

- `MapsSearchPage` com grid de categorias
- Default radius 5 km; persistir seleção na sessão

## Dependencies

### Requires
- 003-location-permission-fallback
- 002-poi-category-queries (API)

### Enables
- 005-poi-results-and-selection
- 008-maps-ai-assist

## Out of Scope

- Lista de resultados (story 005)
