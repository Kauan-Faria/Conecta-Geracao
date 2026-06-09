---
stage: implement
bolt: 015-in-app-maps-navigation-ui
created: 2026-06-09T00:09:52Z
---

## Implementation Walkthrough: 015-in-app-maps-navigation-ui

### Summary

Implementado o fluxo Mapas no mobile: aba no shell, busca de POIs, rota estática OSRM, handoff chat→Mapas via `map_action` e botão "Pedir ajuda à IA". Inclui scaffolding mínimo dos bolts 013/014 (aba, mapa base, busca e GPS) necessário para E2E.

### Structure Overview

Feature `maps` em camadas domain/data/presentation com Riverpod. Integração no GoRouter (aba Mapas), extensão de `ChatMessage` e `ChatPage` para handoff e contexto IA.

### Completed Work

- [x] `apps/mobile/lib/features/maps/domain/geo_point.dart` — coordenadas compartilhadas
- [x] `apps/mobile/lib/features/maps/domain/poi_category.dart` — 6 categorias MVP + labels PT
- [x] `apps/mobile/lib/features/maps/domain/poi_result.dart` — modelo POI da API
- [x] `apps/mobile/lib/features/maps/domain/map_action.dart` — parse `metadata.map_action`
- [x] `apps/mobile/lib/features/maps/domain/maps_context.dart` — contexto chat↔mapas
- [x] `apps/mobile/lib/features/maps/domain/route_summary.dart` — rota, decode polyline, formatação PT
- [x] `apps/mobile/lib/features/maps/data/maps_api.dart` — REST search/geocode/route
- [x] `apps/mobile/lib/features/maps/data/maps_repository.dart` — repositório maps
- [x] `apps/mobile/lib/features/maps/presentation/maps_providers.dart` — providers + handoff
- [x] `apps/mobile/lib/features/maps/presentation/location_controller.dart` — GPS + geocode fallback
- [x] `apps/mobile/lib/features/maps/presentation/maps_search_controller.dart` — busca e handoff
- [x] `apps/mobile/lib/features/maps/presentation/maps_route_controller.dart` — carrega rota OSRM
- [x] `apps/mobile/lib/features/maps/presentation/maps_search_page.dart` — tela busca + resultados
- [x] `apps/mobile/lib/features/maps/presentation/maps_route_page.dart` — rota estática no mapa
- [x] `apps/mobile/lib/features/maps/presentation/widgets/maps_map_widget.dart` — flutter_map + OSM
- [x] `apps/mobile/lib/features/maps/presentation/widgets/map_action_button.dart` — CTA chat
- [x] `apps/mobile/lib/features/maps/presentation/widgets/maps_ai_assist_button.dart` — ajuda IA
- [x] `apps/mobile/lib/features/chat/domain/chat_message.dart` — campo `mapAction`
- [x] `apps/mobile/lib/features/chat/presentation/widgets/chat_message_bubble.dart` — botão "Ver no mapa"
- [x] `apps/mobile/lib/features/chat/presentation/chat_page.dart` — handoff, banner maps, sugestões IA
- [x] `apps/mobile/lib/core/routing/app_router.dart` — rotas `/maps`, `/maps/route`, query chat
- [x] `apps/mobile/lib/features/shell/presentation/app_shell.dart` — aba Mapas
- [x] `apps/mobile/pubspec.yaml` — flutter_map, latlong2, geolocator
- [x] Permissões de localização Android/iOS
- [x] `apps/mobile/test/features/maps/maps_domain_test.dart` — parse map_action, polyline, formatação

### Key Decisions

- **Scaffolding 013/014 inline**: bolts dependentes ainda `planned`; entregue o mínimo (aba, busca, GPS) no mesmo diff para fluxo funcional.
- **Confirmação explícita no handoff**: botão "Ver no mapa" — sem auto-navegação.
- **Polyline decode inline**: algoritmo Google polyline sem dependência extra (OSRM retorna mesmo formato).

### Deviations from Plan

- Implementadas telas/controles de busca e localização (escopo formal dos bolts 013/014) porque 015 não opera sem eles.

### Dependencies Added

- [x] `flutter_map` — renderização mapa OSM
- [x] `latlong2` — coordenadas e polylines
- [x] `geolocator` — permissão e GPS

### Developer Notes

- API base: `POST /api/v1/maps/search|geocode|route`
- Handoff: `mapsHandoffProvider` + query params `/maps?category=&radiusKm=`
- Testes: `flutter test` — 50 testes passando
