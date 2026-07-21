---
id: 026-tutorials-ui
unit: 001-tutorials-ui
intent: 005-tutorials-tab
type: simple-construction-bolt
status: complete
stories:
  - 001-add-tutorials-tab
  - 002-youtube-inline-player
  - 003-tutorials-catalog-list
created: 2026-07-20T20:57:00.000Z
started: 2026-07-20T21:05:00.000Z
completed: "2026-07-21T00:28:37Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-07-20T21:06:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-07-20T21:22:00.000Z
    artifact: implementation-walkthrough.md
  - name: test
    completed: 2026-07-20T21:32:00Z
    artifact: test-walkthrough.md
requires_bolts: []
enables_bolts: []
requires_units: []
blocks: false
complexity:
  avg_complexity: 1
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 2
---

# Bolt: 026-tutorials-ui

## Overview

Bolt único que entrega a aba "Tutoriais" no app mobile: nova entrada de
navegação e rota, dependência do player do YouTube, catálogo estático e a tela
de lista rolável com players inline.

## Objective

Implementar, ponta a ponta, a aba Tutoriais (índice 3, entre Chat e
Configurações) exibindo 2 vídeos do YouTube reproduzidos inline via
`youtube_player_iframe`, com catálogo em código fácil de estender.

## Stories Included

- **001-add-tutorials-tab**: Nova aba e rota "Tutoriais" no shell (Must)
- **002-youtube-inline-player**: Player inline do YouTube — dependência + widget (Must)
- **003-tutorials-catalog-list**: Catálogo estático + lista rolável só com título (Must)

## Bolt Type

**Type**: Simple Construction Bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [x] **1. Plan**: Done → implementation-plan.md
- [x] **2. Implement**: Done → lib/features/tutorials/ + implementation-walkthrough.md
- [x] **3. Test**: Done → test-walkthrough.md

## Dependencies

### Requires
- None

### Enables
- Deploy da feature de tutoriais

## Success Criteria

- [ ] `youtube_player_iframe` adicionado ao pubspec e plataformas configuradas
- [ ] Aba "Tutoriais" no índice 3 com rota `/tutorials`
- [ ] 2 vídeos reproduzindo inline
- [ ] Catálogo em código extensível
- [ ] flutter analyze sem novos erros

## Notes

Ponto de atenção principal: **configuração de plataforma** exigida por
`youtube_player_iframe` (baseada em WebView) — verificar `minSdkVersion` do
Android e ajustes do iOS. Escolher vídeos que permitam incorporação (embed).
URLs iniciais são placeholders a serem trocadas pelo usuário.
