---
id: 003-tutorials-catalog-list
unit: 001-tutorials-ui
intent: 005-tutorials-tab
status: complete
priority: must
created: 2026-07-20T20:57:00.000Z
assigned_bolt: 026-tutorials-ui
implemented: true
---

# Story: 003-tutorials-catalog-list

## User Story

**As a** usuário do app
**I want** ver uma lista de tutoriais em vídeo com seus títulos
**So that** eu identifique e assista ao passo a passo que preciso

## Acceptance Criteria

- [ ] **Given** a aba Tutoriais, **When** ela abre, **Then** vejo exatamente 2 tutoriais (MVP), cada um com título acima do player.
- [ ] **Given** a lista, **When** o conteúdo excede a tela, **Then** consigo rolar verticalmente.
- [ ] **Given** o catálogo em código, **When** um desenvolvedor troca uma URL ou adiciona um item, **Then** basta alterar a lista de dados, sem mudar a UI.
- [ ] **Given** fontes grandes (acessibilidade), **When** vejo os títulos, **Then** não há overflow e o layout se adapta.

## Technical Notes

- Criar modelo `Tutorial` (id, title, youtubeUrl) em
  `lib/features/tutorials/domain/`.
- Criar catálogo estático (ex.: `const tutorialsCatalog = [...]`) com 2 itens
  placeholder claramente sinalizados (`// TODO: trocar pela URL definitiva`).
- `TutorialsPage` renderiza `ListView`/`SingleChildScrollView` de cards; cada
  card = título (Text) + `TutorialVideoPlayer` da story 002.
- Seguir `AppSpacing`, tema e padrão visual (cards) já usados no app.

## Dependencies

### Requires
- 001-add-tutorials-tab (página existe)
- 002-youtube-inline-player (widget de player)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Catálogo vazio | Exibir estado vazio amigável (defensivo) |
| Título muito longo | Truncar ou quebrar sem quebrar layout |

## Out of Scope

- Descrição por tutorial (decisão MVP: só título).
- Ordenação/filtro/busca.
