---
stage: test
bolt: 015-in-app-maps-navigation-ui
created: 2026-06-09T00:20:01Z
---

## Test Report: 015-in-app-maps-navigation-ui

### Summary

- **Tests**: 53/53 passed
- **Coverage**: caminhos críticos de domínio e UI do handoff (sem cobertura E2E com API real)

### Test Files

- [x] `apps/mobile/test/features/maps/maps_domain_test.dart` — parse `map_action`, polyline, formatação PT
- [x] `apps/mobile/test/features/maps/map_action_ui_test.dart` — botão "Ver no mapa", touch target ≥ 48dp
- [x] `apps/mobile/test/features/chat/chat_message_test.dart` — regressão parse mensagem assistant
- [x] `apps/mobile/test/features/shell/app_shell_test.dart` — aba Mapas visível no shell

### Acceptance Criteria Validation

- ✅ **006 — marcadores + polyline**: `MapsRoutePage` renderiza `MarkerLayer` + `PolylineLayer` após `POST /maps/route` (validado por implementação + decode polyline testado)
- ✅ **006 — distância/tempo simples**: `formatRouteDistance` / `formatRouteDuration` com testes unitários
- ✅ **006 — falha OSRM + retry**: `MapsRouteController` + UI com mensagem amigável e botão "Tentar de novo"
- ✅ **006 — Centralizar ≥ 48dp**: FAB 48×48 em `MapsRoutePage`
- ✅ **007 — botão "Ver no mapa"**: widget test confirma visibilidade e tap
- ✅ **007 — categoria/raio pré-preenchidos**: `applyHandoff` + query params `/maps?category=&radiusKm=`
- ✅ **007 — GPS acionado**: `LocationController.ensureCenter()` no handoff quando `center == null`
- ✅ **007 — conversa intacta**: navegação via `context.go('/maps')` sem reset de `ChatController`
- ✅ **008 — "Pedir ajuda à IA"**: `MapsAiAssistButton` navega `/chat?context=maps&category=…`
- ✅ **008 — sugestão IA atualiza seletores**: `ChatPage` listener aplica `applySuggestion` em respostas com `map_action`

### Manual Test Plan (pendente em device)

1. Chat autenticado: "farmácia perto de mim" → botão **Ver no mapa** → aba Mapas com farmácia/5 km
2. Buscar → selecionar POI → rota com polyline e texto de distância
3. Aba Mapas → **Pedir ajuda à IA** → banner contextual no chat
4. GPS negado → informar bairro → busca funciona

### Issues Found

Nenhum bloqueador nos testes automatizados.

### Notes

- E2E com Overpass/OSRM real depende de backend rodando e rede; recomendado smoke test manual no emulador.
- Scaffolding 013/014 incluído no mesmo diff — bolts 013/014 no memory-bank permanecem `planned` até execução formal separada (ou replanejamento).
