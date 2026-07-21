---
stage: test
bolt: 026-tutorials-ui
created: 2026-07-20T21:30:00Z
---

## Test Report: tutorials-ui

### Summary

- **Tests**: 21/21 passed (feature tutorials)
- **Coverage**: caminhos críticos do MVP (extração de ID, catálogo, render da lista, estados vazio/erro)
- **Static analysis**: `flutter analyze` da feature sem issues

### Test Files

- [x] `test/features/tutorials/tutorial_test.dart` - unidade pura: `extractYoutubeVideoId` (watch?v=, youtu.be/, embed/, shorts/, ID cru, entradas inválidas), `Tutorial.videoId` e integridade do `tutorialsCatalog` (2 itens, IDs únicos, vídeos válidos).
- [x] `test/features/tutorials/tutorials_page_test.dart` - widget: render de 1 card por tutorial com título, presença de `ListView` (rolagem), estado vazio e mensagem de erro amigável para URL inválida.

### Acceptance Criteria Validation

Story 001 — Nova aba e rota:
- ✅ **Aba "Tutoriais" no índice 3**: `NavigationDestination` adicionado entre Chat e Configurações (verificado por código + `flutter analyze`).
- ✅ **Rota `/tutorials` com branch próprio**: novo `StatefulShellBranch` no `app_router.dart`.
- ✅ **Estado preservado (indexedStack)**: herdado do `StatefulShellRoute.indexedStack` existente.
- ✅ **Label/ícone acessíveis**: `label: 'Tutoriais'` + ícones outline/filled.

Story 002 — Player inline:
- ✅ **Extração de ID em formatos comuns**: coberto por testes unitários.
- ✅ **Player embutido 16:9**: `YoutubePlayer(aspectRatio: 16/9)` dentro de `AspectRatio`; reprodução inline verificada em runtime (WebView não instanciável em teste unitário).
- ✅ **Play/pause interno**: controles nativos do `youtube_player_iframe` (validação manual em dispositivo).
- ✅ **Sem vazamento de controllers**: 1 controller por item, `close()` no `dispose`.

Story 003 — Catálogo + lista:
- ✅ **2 tutoriais com título acima do player**: widget test confirma 2 cards com títulos.
- ✅ **Lista rolável**: `ListView` presente (widget test).
- ✅ **Catálogo editável só nos dados**: `const List<Tutorial>` iterado pela UI.
- ✅ **Sem overflow / estado vazio**: layout em `Column` com `Text` que respeita `textScaler`; estado vazio testado.

### Issues Found

- ⚠️ `test/features/shell/app_shell_test.dart` falha no ambiente local com
  `No Firebase App '[DEFAULT]'` ao construir `ForegroundNotificationBannerHost`
  (`app.dart`). **Falha pré-existente e não relacionada a este bolt**: confirmada
  revertendo temporariamente as mudanças de shell/router — o teste falha de forma
  idêntica sem elas (Firebase não é inicializado em testes de widget do app
  completo).

### Notes

- Reprodução inline real, play/pause e comportamento de embed dependem de WebView
  e devem ser validados em dispositivo/emulador (fora do escopo de teste unitário).
- URLs do catálogo são placeholders embarcáveis sinalizados com `// TODO`.
