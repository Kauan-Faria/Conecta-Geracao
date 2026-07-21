---
stage: plan
bolt: 026-tutorials-ui
created: 2026-07-20T21:05:00Z
---

## Implementation Plan: tutorials-ui

### Objective

Entregar, ponta a ponta, a aba "Tutoriais" no app mobile: um novo destino de
navegação (índice 3, entre Chat e Configurações) e rota `/tutorials`, com uma
lista rolável de tutoriais em vídeo do YouTube reproduzidos inline via
`youtube_player_iframe`, alimentada por um catálogo estático em código (2 vídeos
placeholder no MVP) e fácil de estender.

### Deliverables

- **Dependência**: `youtube_player_iframe` adicionado ao `pubspec.yaml` +
  configuração de plataforma (Android `minSdk`/`AndroidManifest`, iOS se preciso).
- **Domínio**: modelo `Tutorial` (`id`, `title`, `youtubeUrl`) + helper
  `extractYoutubeVideoId` para `watch?v=`, `youtu.be/`, `embed/`.
- **Catálogo estático**: `tutorialsCatalog` (2 itens placeholder sinalizados com
  `// TODO: trocar pela URL definitiva`).
- **Widget de player**: `TutorialVideoPlayer` reutilizável (recebe `youtubeUrl`,
  gerencia `YoutubePlayerController`, mantém 16:9, trata loading/erro).
- **Página**: `TutorialsPage` — lista rolável de cards (título + player), estados
  de catálogo vazio e ID inválido.
- **Navegação**: `NavigationDestination` "Tutoriais" no índice 3 do `AppShell` e
  novo `StatefulShellBranch` com `GoRoute(path: '/tutorials')` entre `/chat` e
  `/settings` no `app_router.dart`.

### Dependencies

- **`youtube_player_iframe`** (pub.dev): player inline multiplataforma baseado em
  WebView. Necessário para reprodução embutida sem sair do app.
- Reutiliza shell/rotas existentes (`AppShell`, `StatefulShellRoute.indexedStack`),
  `AppScaffold`, `AppSpacing`, tema Material 3.

### Technical Approach

Arquitetura por feature em `apps/mobile/lib/features/tutorials/`:

```text
features/tutorials/
  domain/
    tutorial.dart              # modelo Tutorial + extractYoutubeVideoId
    tutorials_catalog.dart     # catálogo estático (2 itens placeholder)
  presentation/
    tutorials_page.dart        # lista rolável de cards (título + player)
    widgets/
      tutorial_video_player.dart  # player inline 16:9 + loading/erro
```

- **Player**: um `YoutubePlayerController` por item, criado em `initState` e
  liberado em `dispose` (evita vazamento). `autoPlay: false`, `mute: false`.
  Envolver com `YoutubePlayerScaffold`/`AspectRatio 16:9`.
- **Extração de ID**: helper puro e testável; retorna `null` para URL inválida →
  card mostra mensagem de erro amigável em vez de quebrar a lista.
- **Navegação**: manter simetria entre a ordem dos branches e a ordem dos
  `NavigationDestination` (Tutoriais = índice 3, Configurações passa a 4).
- **Acessibilidade**: título como `Text` com `textScaler` respeitado, sem
  overflow; `NavigationDestination` já tem label textual; ícones outline/filled.
- **Plataforma Android**: garantir `minSdk >= 20` (exigência WebView da lib);
  hoje usa `flutter.minSdkVersion` (Flutter default 21+) — validar no build.

### Acceptance Criteria

Story 001 — Nova aba e rota:
- [ ] NavigationBar mostra 5 abas na ordem: Início, Mapas, Chat, Tutoriais, Configurações.
- [ ] Tocar em "Tutoriais" navega para `/tutorials` e seleciona a aba.
- [ ] Estado da branch preservado ao trocar/voltar (padrão `indexedStack`).
- [ ] Destino com label acessível e ícone outline/selecionado.

Story 002 — Player inline:
- [ ] Vídeo aparece em player embutido (não abre app externo).
- [ ] Play/pause funciona dentro do app.
- [ ] ID extraído de `watch?v=`, `youtu.be/`, `embed/`.
- [ ] Player respeita proporção 16:9 e largura disponível.

Story 003 — Catálogo + lista:
- [ ] Aba mostra exatamente 2 tutoriais (MVP), título acima do player.
- [ ] Lista rola verticalmente quando excede a tela.
- [ ] Adicionar/editar tutorial exige mexer só na lista de dados.
- [ ] Sem overflow com fontes grandes.

Qualidade / bolt:
- [ ] `youtube_player_iframe` no pubspec e plataformas configuradas.
- [ ] `flutter analyze` sem novos erros.
- [ ] Estados de carregamento e erro do player tratados.
