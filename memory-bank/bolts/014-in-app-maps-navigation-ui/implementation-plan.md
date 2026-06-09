---
stage: plan
bolt: 014-in-app-maps-navigation-ui
created: 2026-06-09T00:49:09Z
---

## Implementation Plan: 002-in-app-maps-navigation-ui

### Objective

Entregar o fluxo completo de busca na aba Mapas: permissão GPS com fallback bairro/cidade, tela de busca com 6 categorias e raio 2/5/10 km, e lista de resultados POI com seleção para rota.

### Contexto: Gap Analysis

O repositório já contém implementação substancial que cobre a maior parte deste bolt (similar ao bolt 013):

| Área | Arquivo existente | Status |
|------|-------------------|--------|
| Permissão GPS + fallback manual | `location_controller.dart` | ⚠️ Funcional, falta diálogo explicativo pré-permissão |
| Geocodificação manual | `location_controller.dart` + `maps_api.dart` | ✅ Chama `POST /api/v1/maps/geocode` |
| Tela de busca | `maps_search_page.dart` | ⚠️ Categorias sem ícones; rótulos divergem da story |
| 6 categorias + raio | `poi_category.dart`, `maps_search_page.dart` | ✅ Enum + SegmentedButton 2/5/10 km (padrão 5) |
| Busca POI | `maps_search_controller.dart` + `maps_api.dart` | ✅ Chama `POST /api/v1/maps/search` |
| Lista de resultados | `maps_search_page.dart` | ⚠️ Distância sem formato "a X m/km"; mensagem vazia diverge |
| Seleção → rota | `maps_search_page.dart` → `/maps/route` | ✅ Navega com `MapsRouteArgs` |
| Botão IA | `maps_ai_assist_button.dart` | ✅ "Pedir ajuda à IA" com touch target ≥ 48dp |
| API backend | bolt 011 (complete) | ✅ Endpoints search/geocode disponíveis |
| Shell + mapa base | bolt 013 (complete) | ✅ Aba Mapas + `MapsMapWidget` |

**Gaps identificados** (trabalho restante neste bolt):

1. **Diálogo explicativo de localização** (story 003) — hoje `Geolocator.requestPermission()` é chamado direto; falta diálogo em linguagem simples antes do pedido nativo
2. **Rótulos de categoria** (story 004) — alinhar: Hospital/UPA, Banco/Lotérica, Supermercado (hoje: Hospital, Banco, Mercado)
3. **Ícones nas categorias** (story 004) — story exige ícone + rótulo; hoje só `FilterChip` com texto
4. **Formato de distância** (story 005) — exibir "a X metros" ou "a X km" em vez de "Xm" cru
5. **Mensagem lista vazia** (story 005) — alinhar texto: "Não encontrei nenhum lugar por perto. Tente aumentar a distância."
6. **Mensagem geocode falhou** (story 003) — alinhar: "Não encontrei esse lugar. Tente outro bairro."
7. **Acessibilidade resultados** (story 005) — `semanticLabel` completo em cada item da lista
8. **Testes ausentes** — sem widget/unit tests para fluxo de busca, fallback manual e resultados

### Deliverables

- [ ] Ajustes em `location_controller.dart` — diálogo pré-permissão via callback/UI layer
- [ ] Ajustes em `poi_category.dart` — rótulos + ícones por categoria
- [ ] Ajustes em `maps_search_page.dart` — grid de categorias com ícone, formatação distância, mensagens alinhadas, semantics
- [ ] Helper de formatação de distância (ex.: `formatDistance(int meters)`)
- [ ] Widget/unit tests:
  - `location_controller_test.dart` — estados GPS negado, geocode manual, erro
  - `maps_search_controller_test.dart` — busca com/sem categoria, lista vazia, erro API
  - `maps_search_page_test.dart` — UI categorias, raio, resultados, fallback manual
- [ ] `implementation-walkthrough.md` (Stage 2)
- [ ] `test-walkthrough.md` (Stage 3)

### Dependencies

- **011-maps-services-api** (✅ complete): `POST /api/v1/maps/search`, `POST /api/v1/maps/geocode`
- **013-in-app-maps-navigation-ui** (✅ complete): shell, rota `/maps`, `MapsMapWidget`
- **geolocator** (✅ no pubspec): permissão GPS
- **flutter_riverpod** (✅): `LocationController`, `MapsSearchController`

### Technical Approach

#### Story 003 — GPS ou cidade/bairro

1. Extrair callback `Future<bool> onRequestLocationPermission()` no fluxo de `ensureCenter()` — UI (`MapsSearchPage`) exibe `AlertDialog` explicando por que pede localização antes de chamar `Geolocator.requestPermission()`
2. Manter fallback: se negado → campo "Bairro ou cidade" + botão "Usar este lugar"
3. `geocodeManualPlace()` já chama API; alinhar mensagem de erro para texto da story
4. Testes unitários mockando `MapsRepository` e `Geolocator` (via override/injeção)

#### Story 004 — Tela de busca direta

1. Adicionar `icon` getter em `PoiCategory` (Material Icons: local_pharmacy, local_hospital, etc.)
2. Substituir `FilterChip` por botões/cards com ícone + rótulo (≥ 48dp)
3. Manter `SegmentedButton` para raio 2/5/10 km com semantics
4. Botão "Buscar lugares" dispara `search()` — já implementado
5. `MapsAiAssistButton` permanece no rodapé — já implementado

#### Story 005 — Lista e seleção POI

1. Criar `formatDistance(int meters)` → "a 350 metros" / "a 1,2 km"
2. Ordenação por distância vem da API — manter como está
3. Mensagem vazia alinhada à story no `MapsSearchController`
4. `ListTile` com `semanticLabel` composto: nome + endereço + distância
5. Tap seleciona POI e navega para `/maps/route` — já implementado
6. Testes widget: pump com mocks, verificar lista, mensagem vazia, tap navega

#### Fora de escopo deste bolt

- Rota estática no mapa (story 006 → bolt 015)
- Handoff chat → Mapas (story 007 → bolt 015)
- Auxílio IA contextualizado além do botão (story 008 → bolt 015)

### Acceptance Criteria

#### 003-location-permission-fallback

- [ ] Diálogo explica em linguagem simples por que pede localização
- [ ] Permissão concedida → usa coordenadas GPS
- [ ] Permissão negada → campo "Em qual bairro ou cidade?" com texto grande
- [ ] "Centro, Campinas" geocodifica via API e vira centro
- [ ] Geocodificação falha → "Não encontrei esse lugar. Tente outro bairro."

#### 004-maps-search-screen

- [ ] 6 botões categoria com ícone + rótulo: Farmácia, UBS, Hospital/UPA, Banco/Lotérica, Correios, Supermercado
- [ ] Raio 2/5/10 km (padrão 5) com rótulos acessíveis
- [ ] "Buscar" dispara busca POI com localização (GPS ou bairro)
- [ ] Botão "Pedir ajuda à IA" no rodapé (≥ 48dp)

#### 005-poi-results-and-selection

- [ ] Lista ordenada por distância: nome, endereço, "a X metros/km"
- [ ] Lista vazia → "Não encontrei nenhum lugar por perto. Tente aumentar a distância."
- [ ] Tap seleciona POI e avança para rota no mapa
- [ ] Leitor de tela: label semântico completo por item

### Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Código antecipado dificulta medir progresso | Gap analysis + testes como prova de aceite |
| Geolocator não mockável em testes | Override de `LocationController` nos widget tests (padrão já usado em bolt 013) |
| API real indisponível em CI | Mock de `MapsRepository` nos testes de controller/page |
| Diálogo de permissão varia por plataforma | Testar lógica de estado; diálogo customizado é controlado por nós |

### Estimativa

- **Plan**: concluído neste artefato
- **Implement**: ~2–3h (ajustes UI/textos + diálogo + helper distância)
- **Test**: ~1–2h (controller + widget tests)
