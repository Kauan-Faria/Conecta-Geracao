---
id: 001-add-tutorials-tab
unit: 001-tutorials-ui
intent: 005-tutorials-tab
status: complete
priority: must
created: 2026-07-20T20:57:00.000Z
assigned_bolt: 026-tutorials-ui
implemented: true
---

# Story: 001-add-tutorials-tab

## User Story

**As a** usuário do app
**I want** ver uma aba "Tutoriais" entre "Chat" e "Configurações"
**So that** eu consiga acessar rapidamente os vídeos que ensinam a usar o app

## Acceptance Criteria

- [ ] **Given** o app aberto e autenticado/convidado, **When** eu olho a barra de navegação, **Then** vejo 5 abas na ordem: Início, Mapas, Chat, Tutoriais, Configurações.
- [ ] **Given** estou em qualquer aba, **When** toco em "Tutoriais", **Then** navego para a rota `/tutorials` e a aba fica selecionada.
- [ ] **Given** naveguei em Tutoriais, **When** troco de aba e volto, **Then** o estado da branch é preservado (padrão `indexedStack`).
- [ ] **Given** a aba "Tutoriais", **When** leitor de tela está ativo, **Then** o destino tem `label` acessível e ícone outline/selecionado.

## Technical Notes

- Adicionar `NavigationDestination` no índice 3 em
  `apps/mobile/lib/features/shell/presentation/app_shell.dart` (ícone sugerido:
  `Icons.ondemand_video_outlined` / `Icons.ondemand_video`).
- Adicionar novo `StatefulShellBranch` com `GoRoute(path: '/tutorials')` em
  `apps/mobile/lib/core/routing/app_router.dart`, na posição entre o branch de
  `/chat` e o de `/settings` (para manter o índice consistente com a NavigationBar).
- Criar `TutorialsPage` em `lib/features/tutorials/presentation/`.

## Dependencies

### Requires
- None

### Enables
- 003-tutorials-catalog-list (a página hospeda a lista)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Ordem dos branches divergente da NavigationBar | Índices devem casar; Tutoriais = índice 3 |
| Deep link direto para `/tutorials` | Abre a aba corretamente |

## Out of Scope

- Conteúdo/lista de vídeos (story 003).
- Player (story 002).
