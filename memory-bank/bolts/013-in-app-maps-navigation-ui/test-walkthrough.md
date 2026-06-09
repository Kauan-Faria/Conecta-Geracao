---
stage: test
bolt: 013-in-app-maps-navigation-ui
created: 2026-06-09T00:45:00Z
---

## Test Report: 002-in-app-maps-navigation-ui

### Summary

- **Tests**: 59/59 passed
- **Coverage**: Não medido (widget tests focados em caminhos críticos do bolt)

### Test Files

- [x] `apps/mobile/test/features/shell/maps_navigation_test.dart` — navegação aba Mapas, guest, deep link, touch target
- [x] `apps/mobile/test/features/maps/maps_map_widget_test.dart` — renderização OSM, atribuição, pinch-zoom
- [x] `apps/mobile/test/features/shell/app_shell_test.dart` — label "Mapas" visível no shell (pré-existente)
- [x] `apps/mobile/test/helpers/maps_test_helpers.dart` — helper com location mockada para testes estáveis

### Acceptance Criteria Validation

#### 001-maps-tab-shell

- ✅ **Guest e autenticado veem aba Mapas**: `app_shell_test` + `maps_navigation_test` (guest)
- ✅ **Tap abre tela in-app**: `maps_navigation_test` confirma `MapsSearchPage`
- ✅ **Rótulo textual e alvo ≥ 48dp**: teste verifica label "Mapas", ícone e `NavigationBar` ≥ 48dp
- ✅ **Deep link `/maps` ativa aba**: `selectedIndex == 1` após `router.go('/maps')`

#### 002-flutter-map-base

- ✅ **Mapa OSM via flutter_map**: `maps_map_widget_test` encontra `FlutterMap`
- ✅ **Atribuição OSM visível**: texto "OpenStreetMap" presente
- ✅ **Pinch-zoom habilitado**: `InteractiveFlag.hasPinchZoom` true nos defaults
- ⚠️ **p95 < 3s**: validação manual recomendada (fora do escopo de widget test automatizado)

### Issues Found

Nenhum issue bloqueante. Aviso informativo do `flutter_map` sobre política de uso dos tile servers OSM — esperado em dev/test.

### Notes

- Suíte completa `flutter test` executada sem regressões (59 testes).
- Critério de performance (p95 < 3s) depende de rede/dispositivo; recomenda-se smoke test manual em dispositivo físico antes do release.
