---
stage: implement
bolt: 014-in-app-maps-navigation-ui
created: 2026-06-09T00:59:02Z
---

## Implementation Walkthrough: 002-in-app-maps-navigation-ui

### Summary

Bolt entregou o fluxo de busca na aba Mapas: diálogo explicativo antes do pedido de GPS, fallback bairro/cidade, categorias com ícones, formatação de distância nos resultados e mensagens alinhadas às stories. Testes unitários e widget cobrem localização, busca e UI.

### Structure Overview

A camada de apresentação continua em Riverpod (`LocationController`, `MapsSearchController`) com UI em `MapsSearchPage`. Novos helpers de domínio e widget dedicado para categorias separam formatação e layout da lógica de busca.

### Completed Work

- [x] `apps/mobile/lib/features/maps/domain/distance_formatter.dart` — formata distância POI em português ("a X metros/km")
- [x] `apps/mobile/lib/features/maps/domain/poi_category.dart` — rótulos alinhados às stories + ícones Material por categoria
- [x] `apps/mobile/lib/features/maps/presentation/location_controller.dart` — callback de diálogo pré-permissão e mensagem de geocode alinhada
- [x] `apps/mobile/lib/features/maps/presentation/maps_search_controller.dart` — mensagem de lista vazia alinhada à story 005
- [x] `apps/mobile/lib/features/maps/presentation/maps_search_page.dart` — diálogo GPS, grid de categorias, distância formatada, semantics nos resultados
- [x] `apps/mobile/lib/features/maps/presentation/widgets/maps_category_button.dart` — botão categoria com ícone + rótulo (≥ 48dp)
- [x] `apps/mobile/test/helpers/fake_maps_repository.dart` — fake de repositório para testes
- [x] `apps/mobile/test/features/maps/distance_formatter_test.dart` — unit tests do formatter
- [x] `apps/mobile/test/features/maps/maps_search_flow_test.dart` — tests de LocationController e MapsSearchController
- [x] `apps/mobile/test/features/maps/maps_search_page_test.dart` — widget tests da tela de busca

### Key Decisions

- **Diálogo customizado antes do GPS**: `LocationController` recebe `setPermissionExplainer()` da UI, mantendo texto amigável sem acoplar Flutter ao controller de forma permanente.
- **Formatter separado de rota**: `formatPoiDistance` distinto de `formatRouteDistance` porque o copy das stories usa "a X metros" vs "cerca de X m" da rota.
- **MapsCategoryButton dedicado**: encapsula ícone + rótulo + touch target sem inflar `MapsSearchPage`.

### Deviations from Plan

Nenhuma — todos os gaps do plano foram endereçados.

### Dependencies Added

Nenhuma dependência nova adicionada.

### Developer Notes

- Widget tests usam viewport alto (1200px) e `pump` curto em vez de `pumpAndSettle` para evitar timers do `flutter_map`.
- Seleção de POI navega para `/maps/route` (escopo do bolt 015 validar rota completa).
