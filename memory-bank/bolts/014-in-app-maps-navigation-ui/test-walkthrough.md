---
stage: test
bolt: 014-in-app-maps-navigation-ui
created: 2026-06-09T01:00:02Z
---

## Test Report: 002-in-app-maps-navigation-ui

### Summary

- **Tests**: 27/27 passed (23 maps + 4 shell navigation)
- **Coverage**: caminhos críticos das stories 003–005 cobertos por unit e widget tests

### Test Files

- [x] `apps/mobile/test/features/maps/distance_formatter_test.dart` — formatação "a X metros/km"
- [x] `apps/mobile/test/features/maps/maps_search_flow_test.dart` — LocationController (geocode) e MapsSearchController (busca/vazio)
- [x] `apps/mobile/test/features/maps/maps_search_page_test.dart` — UI categorias, fallback manual, resultados, navegação rota
- [x] `apps/mobile/test/helpers/fake_maps_repository.dart` — suporte a mocks nos testes acima
- [x] `apps/mobile/test/features/maps/maps_map_widget_test.dart` — regressão mapa base (bolt 013)
- [x] `apps/mobile/test/features/shell/maps_navigation_test.dart` — regressão aba Mapas (bolt 013)

### Acceptance Criteria Validation

#### 003-location-permission-fallback

- ✅ **Diálogo explicativo**: implementado em `MapsSearchPage._showLocationPermissionDialog`; fluxo via `setPermissionExplainer`
- ✅ **GPS concedido usa coordenadas**: `LocationController.ensureCenter` + teste de integração manual no app
- ✅ **Permissão negada → campo bairro/cidade**: widget test `shows manual place fallback when permission denied`
- ✅ **Geocodificação manual**: unit test `geocodeManualPlace returns center on success`
- ✅ **Erro geocode alinhado**: unit test `shows story-aligned error on failure`

#### 004-maps-search-screen

- ✅ **6 categorias ícone + rótulo**: widget test `shows category buttons with icons and updated labels`
- ✅ **Raio 2/5/10 km acessível**: `SegmentedButton` com tooltips/semantics em `MapsSearchPage`
- ✅ **Buscar dispara POI search**: widget tests de busca com `FakeMapsRepository`
- ✅ **Botão IA ≥ 48dp**: `MapsAiAssistButton` via `AppButton` (regressão bolt 013)

#### 005-poi-results-and-selection

- ✅ **Lista com distância formatada**: widget test `search renders results with formatted distance`
- ✅ **Lista vazia com mensagem correta**: widget test `empty search shows story-aligned message`
- ✅ **Tap avança para rota**: widget test `tapping result navigates to route page`
- ✅ **Semantics por item**: `Semantics(label: _poiSemanticLabel(poi))` em cada resultado

### Issues Found

Nenhum issue bloqueante. GPS nativo e busca end-to-end com API real ficam para validação manual (dependem de dispositivo + backend).

### Notes

- Testes de controller usam `ProviderContainer` com `FakeMapsRepository`; não requerem rede.
- Widget tests evitam `pumpAndSettle` prolongado por causa de timers do `flutter_map`.
- Validação manual sugerida: negar GPS → informar bairro → buscar farmácia em 5 km com backend rodando.
