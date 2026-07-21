---
intent: 005-tutorials-tab
phase: inception
status: units-decomposed
updated: 2026-07-20T20:57:00Z
---

# Aba de Tutoriais - Unit Decomposition

## Units Overview

Esta intent decompõe-se em **1 unit** de trabalho (feature de UI enxuta):

### Unit 1: 001-tutorials-ui

**Description**: Implementa a aba "Tutoriais" no app mobile: nova entrada de
navegação e rota, modelo/catálogo estático de tutoriais, integração do player
inline do YouTube (`youtube_player_iframe`) e a tela de lista rolável (título +
player), com estados de carregamento/erro.

**Stories**:

- 001-add-tutorials-tab: Nova aba e rota "Tutoriais" no shell
- 002-youtube-inline-player: Player inline do YouTube (dependência + widget)
- 003-tutorials-catalog-list: Catálogo estático + lista rolável (só título)

**Deliverables**:

- Novo destino na `NavigationBar` (índice 3) + branch/rota `/tutorials`
- `pubspec.yaml` com `youtube_player_iframe`
- Feature `lib/features/tutorials/...` (domain + presentation)
- Tela de lista com players inline

**Dependencies**:

- Depends on: nenhuma (usa infraestrutura de shell/rotas já existente)
- Depended by: nenhuma

**Estimated Complexity**: S

## Unit Dependency Graph

```text
[001-tutorials-ui]  (sem dependências)
```

## Execution Order

1. Unit 001-tutorials-ui (única) — implementada em um bolt simples (026).
