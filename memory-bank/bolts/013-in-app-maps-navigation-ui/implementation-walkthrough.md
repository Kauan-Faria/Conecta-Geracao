---
stage: implement
bolt: 013-in-app-maps-navigation-ui
created: 2026-06-09T00:40:00Z
---

## Implementation Walkthrough: 002-in-app-maps-navigation-ui

### Summary

Bolt focado em validar e formalizar a fundação da aba Mapas. O shell e o widget de mapa OSM já existiam no repositório; o trabalho desta etapa foi confirmar os critérios de aceite via testes widget e helpers de teste, sem alterações funcionais no código de produção.

### Structure Overview

A navegação Mapas vive no `StatefulShellRoute` do GoRouter (branch índice 1), com destino na `NavigationBar` do `AppShell`. A tela `/maps` renderiza `MapsSearchPage`, que embute o preview do mapa via `MapsMapWidget` (flutter_map + tiles OSM + atribuição).

### Completed Work

- [x] `apps/mobile/lib/features/shell/presentation/app_shell.dart` — aba Mapas com ícone, rótulo e branch dedicado (pré-existente, validado)
- [x] `apps/mobile/lib/core/routing/app_router.dart` — rota `/maps` no shell com query params (pré-existente, validado)
- [x] `apps/mobile/lib/features/maps/presentation/widgets/maps_map_widget.dart` — mapa OSM reutilizável com atribuição (pré-existente, validado)
- [x] `apps/mobile/lib/features/maps/presentation/maps_search_page.dart` — tela in-app da aba Mapas (pré-existente, validado)
- [x] `apps/mobile/test/helpers/maps_test_helpers.dart` — helper para pump do app com location mockada
- [x] `apps/mobile/test/features/shell/maps_navigation_test.dart` — navegação tap, guest, deep link e touch target
- [x] `apps/mobile/test/features/maps/maps_map_widget_test.dart` — renderização OSM e pinch-zoom habilitado

### Key Decisions

- **Sem renomear `MapsMapWidget`**: story sugere `OsmMapView`, mas o nome existente já está integrado; renomear geraria diff desnecessário neste bolt.
- **Sem alterar deep link**: teste confirmou que `router.go('/maps')` ativa branch índice 1 corretamente.
- **Location mockada nos testes**: `TestLocationController` evita chamadas reais ao Geolocator em widget tests.

### Deviations from Plan

Nenhuma alteração de código de produção foi necessária — apenas testes e helpers. O escopo de busca/GPS em `MapsSearchPage` permanece intacto (bolts 014/015).

### Dependencies Added

Nenhuma dependência nova adicionada (`flutter_map` e `latlong2` já estavam no pubspec).

### Developer Notes

- Deep link `/maps?category=...&radiusKm=...` já parseado no router para bolts futuros.
- `dart format` aplicado em arquivos do módulo maps durante lint — apenas formatação, sem mudança de comportamento.
