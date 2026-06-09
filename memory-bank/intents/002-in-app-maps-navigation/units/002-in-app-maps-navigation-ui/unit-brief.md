---
unit: 002-in-app-maps-navigation-ui
intent: 002-in-app-maps-navigation
phase: inception
status: complete
unit_type: frontend
default_bolt_type: simple-construction-bolt
created: 2026-06-08T20:00:00.000Z
updated: 2026-06-09T00:46:00.000Z
---

# Unit Brief: In-App Maps Navigation UI

## Purpose

Interface mobile Flutter para a aba Mapas — busca de lugares próximos, mapa in-app com flutter_map, permissão de localização, rota estática e integração com o chat existente.

## Scope

### In Scope
- Nova aba "Mapas" no shell (guest + autenticado)
- flutter_map + tiles OSM + atribuição
- Fluxo GPS → busca → resultados → rota estática
- Fallback cidade/bairro quando GPS negado
- Busca direta na aba (6 categorias, raio 2/5/10 km)
- Handoff chat → aba Mapas via `map_action`
- Botão "Pedir ajuda à IA" contextualizado

### Out of Scope
- Turn-by-turn, voz, recálculo em tempo real
- Histórico/favoritos de lugares
- Implementação dos proxies OSM (backend unit)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Nova aba Mapas no shell | Must |
| FR-2 | Detecção intenção (UI — recebe map_action) | Must |
| FR-3 | Permissão GPS + fallback cidade/bairro | Must |
| FR-4 | Busca POI (UI — exibe resultados) | Must |
| FR-5 | Mapa + rota estática (UI) | Must |
| FR-6 | Redirecionamento chat → Mapas | Must |
| FR-7 | Busca direta na aba | Must |
| FR-8 | Auxílio IA na aba (UI) | Should |

---

## Domain Concepts

### Key Screens

| Screen | Description |
|--------|-------------|
| MapsSearchPage | Seletor categoria + localização + raio |
| MapsResultsPage | Lista POIs ordenada por distância |
| MapsRoutePage | Mapa com marcadores e polyline |

### Key State

| State | Description |
|-------|-------------|
| MapsSearchState | category, radiusKm, center, results, selectedPoi |
| LocationPermissionState | granted, denied, manualPlace |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 8 |
| Must Have | 7 |
| Should Have | 1 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-maps-tab-shell | Aba Mapas no shell | Must | Planned |
| 002-flutter-map-base | Mapa OSM base | Must | Planned |
| 003-location-permission-fallback | GPS ou cidade/bairro | Must | Planned |
| 004-maps-search-screen | Busca direta na aba | Must | Planned |
| 005-poi-results-and-selection | Lista e seleção POI | Must | Planned |
| 006-static-route-display | Rota estática no mapa | Must | Planned |
| 007-chat-to-maps-handoff | Chat redireciona para Mapas | Must | Planned |
| 008-maps-ai-assist | Ajuda da IA na aba | Should | Planned |

---

## Dependencies

### Depends On

| Unit | Reason |
|------|--------|
| 001-maps-services-api | Endpoints REST e map_action |
| 001-mobile-auth-shell | Shell/navegação GoRouter |
| 004-digital-guidance-ui | Chat page e controller |

### External Dependencies

| System | Purpose | Risk |
|--------|---------|------|
| flutter_map | Renderização mapa | Baixo |
| geolocator | Permissão GPS | Baixo |
| OSM tile servers | Tiles gratuitos | Baixo |

---

## Technical Context

### Suggested Technology
- `flutter_map` + `latlong2`
- `geolocator` para permissão GPS
- Riverpod providers: `MapsController`, `LocationController`
- GoRouter: rota `/maps`, deep link com query params de map_action

### Integration Points

| Integration | Type | Protocol |
|-------------|------|----------|
| maps-services-api | REST | JSON |
| ChatController | In-app navigation | map_action payload |

---

## Constraints

- Alvos ≥ 48dp; textos simples; crédito OSM visível
- Guest tem acesso completo à aba Mapas
- Portrait only (MVP)

---

## Success Criteria

### Functional
- [ ] Convidado vê aba Mapas e busca farmácia em 5 km
- [ ] GPS negado → pergunta bairro → busca funciona
- [ ] Chat "UBS mais perto" abre Mapas com resultados
- [ ] Seleção de POI exibe rota estática no mapa

### Non-Functional
- [ ] Mapa visível p95 < 3s
- [ ] TalkBack/VoiceOver nos botões de categoria e resultados

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 013-in-app-maps-navigation-ui | simple | 001, 002 | Shell + mapa base |
| 014-in-app-maps-navigation-ui | simple | 003, 004, 005 | Busca e resultados |
| 015-in-app-maps-navigation-ui | simple | 006, 007, 008 | Rota + chat + IA |

---

## Notes

- Reutilizar `AppScaffold`, `AppButton`, tokens de tema existentes
- map_action pode ser JSON no corpo da mensagem IA ou campo dedicado na API de chat
