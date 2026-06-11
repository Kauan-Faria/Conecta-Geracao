---
stage: plan
bolt: 015-in-app-maps-navigation-ui
created: 2026-06-09T00:05:09Z
---

## Implementation Plan: 015-in-app-maps-navigation-ui

### Objective

Completar o fluxo Mapas no mobile: rota estática após seleção de POI, handoff chat→Mapas via `map_action`, e botão "Pedir ajuda à IA" contextualizado na aba Mapas.

### Deliverables

- **MapsRoutePage** — mapa com marcadores origem/destino, polyline Directions, distância/tempo em texto simples, botão "Centralizar" (≥ 48dp), retry em falha Directions
- **Route layer mobile** — `MapsRouteRepository` + `RouteController` (Riverpod) chamando `POST /api/v1/maps/route`
- **MapAction model + parsing** — estender `ChatMessage` com `metadata.map_action`; botão inline "Ver no mapa" no bubble assistant
- **Chat→Mapas handoff** — `ChatController` detecta `map_action`, navega para `/maps` com estado pré-preenchido (categoria, raio, center opcional)
- **MapsAiAssist** — botão "Pedir ajuda à IA" na tela de busca Mapas; deep link `/chat?context=maps&category=…` repassando contexto ao `ChatPage`/`ChatController`
- **Integração com bolts 013/014** — contratos explícitos (providers, rotas, `MapsSearchState`) consumidos sem duplicar busca/GPS

### Dependencies

- **012-maps-services-api** ✅ — API retorna `metadata.map_action` em mensagens assistant (`type: map_search`, `category`, `radiusKm`, `center?`)
- **011-maps-services-api** ✅ — `POST /api/v1/maps/route` retorna `{ polyline, distanceMeters, durationSeconds }`
- **014-in-app-maps-navigation-ui** 🚫 — `MapsSearchPage`, `LocationController`, lista POIs e seleção (stories 003–005). **Bloqueia E2E** até concluído
- **013-in-app-maps-navigation-ui** 🚫 — aba Mapas + `flutter_map` base (stories 001–002). **Bloqueia UI** de rota e navegação
- **004-digital-guidance-ui** ✅ — `ChatPage`, `ChatController`, GoRouter shell existentes

### Pré-requisito recomendado

Executar **013 → 014** antes da Etapa 2 (Implement) deste bolt, ou implementar 015 em paralelo **somente** se 013/014 forem entregues na mesma sprint com contratos abaixo congelados.

### Contratos de integração (013/014 → 015)

| Contrato | Responsável | Consumido por 015 |
|----------|-------------|-------------------|
| Rota GoRouter `/maps` + branch no shell | 013 | handoff chat, botão IA |
| `MapsMapWidget` (flutter_map + OSM attribution) | 013 | `MapsRoutePage` |
| `MapsSearchState` (category, radiusKm, center, results, selectedPoi) | 014 | handoff pré-preenche; rota usa `selectedPoi` + center |
| `LocationController` (GPS / fallback bairro) | 014 | handoff aciona permissão quando `center == null` |
| `MapsRepository.searchPois` | 014 | handoff dispara busca após navegar |
| Navegação resultados → rota | 014 | tap POI → `MapsRoutePage` |

### Technical Approach

#### 1. Estrutura de arquivos (`apps/mobile/lib/features/maps/`)

```text
domain/
  map_action.dart              # parse metadata.map_action
  route_summary.dart           # distanceMeters, durationSeconds, polyline
  maps_context.dart            # contexto chat↔mapas (category, source)
data/
  maps_route_api.dart          # POST /maps/route
  maps_route_repository.dart
presentation/
  maps_route_page.dart         # story 006
  maps_route_controller.dart
  widgets/map_action_button.dart   # "Ver no mapa" no chat
  widgets/maps_ai_assist_button.dart
```

Extensões em features existentes:

- `chat/domain/chat_message.dart` — campo opcional `MapAction? mapAction`
- `chat/presentation/chat_controller.dart` — método `openMapFromAction(MapAction)`
- `chat/presentation/widgets/chat_message_bubble.dart` — CTA "Ver no mapa"
- `core/routing/app_router.dart` — query params `/maps?category=&radiusKm=` e `/chat?context=maps`

#### 2. Story 006 — Rota estática

1. Ao selecionar POI (014), navegar para `MapsRoutePage(origin: center, destination: poi)`
2. Controller chama `POST /api/v1/maps/route` com `{ origin, destination }`
3. Decodificar polyline (formato retornado pela API — alinhar com `RouteResponseDto` do backend)
4. Renderizar `MarkerLayer` (origem/destino) + `PolylineLayer` sobre `MapsMapWidget`
5. Texto abaixo: formatar distância ("cerca de 1,2 km") e tempo ("15 min a pé") em PT-BR simples
6. Erro Directions: banner amigável + `AppButton` "Tentar de novo"
7. Botão flutuante "Centralizar": `MapController.fitCamera` com bounds origem+destino+polyline

**Modo Directions**: `travelMode: DRIVE` no backend (`get-static-route.use-case`); tempo/distância exibidos em texto simples.

#### 3. Story 007 — Chat→Mapas handoff

1. Estender parse JSON da mensagem assistant: `metadata['map_action']`
2. Quando `mapAction != null`, exibir botão "Ver no mapa" (sem auto-navegar — exige confirmação)
3. On tap:
   - `context.go('/maps', extra: mapAction)` ou query params + `MapsHandoffNotifier`
   - `MapsSearchController.applyHandoff(mapAction)` — preenche category/radiusKm/center
   - Se `center == null`, delegar a `LocationController.ensureCenter()` (014)
   - Disparar busca; múltiplos POIs → lista existente (014)
4. Mensagem de confirmação no chat (append local ou reutilizar content assistant): "Abri o mapa para você"
5. Voltar ao chat: conversa intacta (sem reset de `conversationId`)

#### 4. Story 008 — Ajuda IA na aba Mapas

1. Botão secundário "Pedir ajuda à IA" em `MapsSearchPage` (014) — widget exportado por 015
2. Navega: `/chat?context=maps&category={selectedCategory}` (+ `new=true` se conversa nova desejada)
3. Estender `ChatPage` com `MapsContext? initialMapsContext`
4. `ChatController` injeta hint no primeiro envio ou banner contextual ("Estou na aba Mapas…")
5. Quando IA retorna `map_action` ou sugere raio, callback `onMapsSuggestion` atualiza `MapsSearchController` (raio 2/5/10)

### Acceptance Criteria

- [ ] **006**: POI selecionado exibe marcadores origem/destino e polyline Directions
- [ ] **006**: Distância e tempo em linguagem simples abaixo do mapa
- [ ] **006**: Falha Directions mostra mensagem amigável + retry, sem crash
- [ ] **006**: Botão "Centralizar" (≥ 48dp) enquadra rota completa
- [ ] **007**: Resposta com `map_action` mostra botão "Ver no mapa"; tap navega para aba Mapas
- [ ] **007**: Categoria e raio pré-preenchidos conforme payload
- [ ] **007**: GPS necessário aciona fluxo de permissão (014)
- [ ] **007**: Conversa permanece intacta ao voltar do Mapas
- [ ] **008**: "Pedir ajuda à IA" abre chat com contexto Mapas
- [ ] **008**: Sugestão de categoria/raio da IA atualiza seletores na aba Mapas após confirmação

### Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| 013/014 não prontos | Congelar contratos acima; implementar com fakes nos testes; E2E manual após 014 |
| `ChatMessage` sem metadata hoje | Estender `fromJson` + testes de parse |
| Polyline encoding | Reutilizar util do backend/spec; teste unitário decode |

### Testes previstos (Etapa 3)

- Unit: `MapAction.fromJson`, formatação distância/tempo, decode polyline
- Widget: botão "Ver no mapa" visível só com `mapAction`; `MapsRoutePage` estados loading/error/success (mocks)
- Integração manual: chat "farmácia perto" → Mapas → lista → rota
