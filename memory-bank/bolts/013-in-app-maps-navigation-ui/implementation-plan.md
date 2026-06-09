---
stage: plan
bolt: 013-in-app-maps-navigation-ui
created: 2026-06-09T00:33:00Z
---

## Implementation Plan: 002-in-app-maps-navigation-ui

### Objective

Entregar a fundação da aba Mapas: navegação no shell (guest + autenticado) e mapa OSM base via `flutter_map`, com atribuição visível e testes de navegação.

### Contexto: Gap Analysis

O repositório já contém implementação parcial que cobre grande parte deste bolt:

| Área | Arquivo existente | Status |
|------|-------------------|--------|
| Aba Mapas no shell | `app_shell.dart` | ✅ `NavigationDestination` com label "Mapas" |
| Rota `/maps` no GoRouter | `app_router.dart` | ✅ `StatefulShellBranch` dedicado |
| Acesso guest | `app_router.dart` redirect | ✅ `guestGate.isGuestActive` permite acesso |
| Widget mapa OSM | `maps_map_widget.dart` | ✅ `FlutterMap` + tiles OSM + atribuição |
| Dependências | `pubspec.yaml` | ✅ `flutter_map`, `latlong2` |
| Teste shell | `app_shell_test.dart` | ✅ Verifica label "Mapas" visível |

**Gaps identificados** (trabalho restante neste bolt):

1. **Deep link `/maps` ativa aba correta** — verificar se `goBranch` seleciona índice 1 ao navegar direto para `/maps` (critério story 001)
2. **Navegação tap → tela in-app** — teste widget que toca aba Mapas e confirma `MapsSearchPage` (não app externo)
3. **Alvo ≥ 48dp** — `NavigationBar` Material 3 já atende; documentar/validar em teste
4. **Widget test do mapa base** — `MapsMapWidget` renderiza `FlutterMap` e atribuição OSM
5. **Nome do widget** — story sugere `OsmMapView`; código usa `MapsMapWidget` (manter nome existente, alinhar story na implementação)
6. **Escopo do bolt** — `MapsSearchPage` já inclui busca/GPS (stories 003–005); **não alterar** nesse bolt, apenas garantir mapa base embutido funciona

### Deliverables

- [ ] Verificar/ajustar deep link `/maps` para ativar branch Mapas no shell
- [ ] Garantir `MapsMapWidget` atende critérios da story 002 (pinch-zoom, atribuição, tiles OSM)
- [ ] Widget tests:
  - `app_shell_test.dart` — navegação tap na aba Mapas
  - `maps_map_widget_test.dart` — renderização mapa + atribuição
- [ ] `implementation-walkthrough.md` (Stage 2)
- [ ] `test-walkthrough.md` (Stage 3)

### Dependencies

- **001-mobile-auth-shell** (✅ complete): `AppShell`, `StatefulShellRoute`, GoRouter — base de navegação
- **flutter_map** ^8.1.1 + **latlong2** ^0.9.1 (✅ já no pubspec)
- **OSM tile server**: `https://tile.openstreetmap.org/{z}/{x}/{y}.png` com `userAgentPackageName`

### Technical Approach

#### Story 001 — Aba Mapas no shell

1. Revisar `app_shell.dart`: 4 destinos (Início, Mapas, Chat, Configurações); branch índice 1 = Mapas
2. Revisar `app_router.dart`: branch `/maps` → `MapsSearchPage`; query params `category`, `radiusKm` para deep links futuros
3. Se deep link não ativar aba: adicionar redirect ou `initialLocation` no branch Mapas
4. Teste: guest e autenticado veem "Mapas"; tap navega para conteúdo in-app

#### Story 002 — Mapa OSM base

1. Reutilizar `MapsMapWidget` (não renomear — evita diff desnecessário)
2. Confirmar `RichAttributionWidget` com "© OpenStreetMap contributors"
3. Confirmar pinch-zoom habilitado (default `MapOptions` do flutter_map)
4. `MapsSearchPage` exibe preview do mapa (180px) — suficiente para story 002
5. Teste widget: pump `MapsMapWidget`, verificar presença de atribuição OSM

#### Fora de escopo deste bolt

- Permissão GPS / fallback manual (story 003 → bolt 014)
- Busca por categoria/raio/resultados (stories 004–005 → bolt 014)
- Rota estática, handoff chat, IA (stories 006–008 → bolt 015)

### Acceptance Criteria

#### 001-maps-tab-shell

- [ ] Guest e autenticado veem aba "Mapas" na navegação inferior
- [ ] Tap na aba Mapas abre tela in-app (`MapsSearchPage`)
- [ ] Ícone Mapas tem rótulo textual e alvo ≥ 48dp
- [ ] Deep link `/maps` ativa aba Mapas

#### 002-flutter-map-base

- [ ] Aba Mapas exibe mapa OpenStreetMap via `flutter_map`
- [ ] Atribuição "© OpenStreetMap contributors" visível
- [ ] Pinch-zoom funcional (comportamento padrão flutter_map)
- [ ] Mapa carrega em tempo aceitável (validação manual; p95 < 3s fora do escopo de teste automatizado)

### Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Código antecipado inclui features de bolts futuros | Escopo estrito: só validar shell + mapa base; não refatorar busca/GPS |
| Tiles OSM offline em CI | Testes mockam `FlutterMap` ou verificam widget tree sem rede |
| Deep link não seleciona branch | Teste dedicado com `GoRouter` + `pumpAndSettle` |

### Estimativa

- **Plan**: concluído neste artefato
- **Implement**: ~1–2h (ajustes pontuais + testes)
- **Test**: ~1h (widget tests + validação manual opcional)
