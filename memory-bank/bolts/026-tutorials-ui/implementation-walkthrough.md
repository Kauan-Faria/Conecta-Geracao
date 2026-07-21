---
stage: implement
bolt: 026-tutorials-ui
created: 2026-07-20T21:20:00Z
---

## Implementation Walkthrough: tutorials-ui

### Summary

Foi adicionada a aba "Tutoriais" ao app mobile, entre "Chat" e "Configurações",
com uma lista rolável de vídeos-tutoriais do YouTube reproduzidos inline via
`youtube_player_iframe`. O conteúdo vem de um catálogo estático em código (2
itens), e cada item mostra o título acima de um player embutido em 16:9.

### Structure Overview

Feature organizada por camadas em `lib/features/tutorials/`: `domain/` contém o
modelo e a extração de ID do YouTube; `presentation/` contém a página da aba e o
widget de player reutilizável. A navegação foi integrada ao shell existente
(`StatefulShellRoute.indexedStack`) adicionando um novo branch e um destino na
`NavigationBar`, mantendo a simetria de índices (Tutoriais = índice 3).

### Completed Work

- [x] `apps/mobile/lib/features/tutorials/domain/tutorial.dart` - modelo `Tutorial` e helper `extractYoutubeVideoId` (formatos watch?v=, youtu.be/, embed/, shorts/, v/ e ID cru).
- [x] `apps/mobile/lib/features/tutorials/domain/tutorials_catalog.dart` - catálogo estático com 2 tutoriais placeholder sinalizados por `// TODO`.
- [x] `apps/mobile/lib/features/tutorials/presentation/widgets/tutorial_video_player.dart` - player inline 16:9 que gerencia um `YoutubePlayerController` por item e exibe erro amigável para URL inválida.
- [x] `apps/mobile/lib/features/tutorials/presentation/tutorials_page.dart` - página da aba com lista rolável de cards (título + player) e estado vazio defensivo.
- [x] `apps/mobile/lib/core/routing/app_router.dart` - novo `StatefulShellBranch` com `GoRoute(path: '/tutorials')` entre `/chat` e `/settings`.
- [x] `apps/mobile/lib/features/shell/presentation/app_shell.dart` - `NavigationDestination` "Tutoriais" no índice 3 (ícone `ondemand_video`).
- [x] `apps/mobile/pubspec.yaml` - dependência `youtube_player_iframe` adicionada.

### Key Decisions

- **Um controller por item (StatefulWidget)**: cada `TutorialVideoPlayer` cria seu `YoutubePlayerController` em `initState` e o libera em `dispose`, evitando vazamento com múltiplos players. Com 2 vídeos no MVP, os players são renderizados diretamente (não via thumbnail lazy) para atender ao critério "vídeo aparece embutido ao renderizar".
- **Extração de ID no domínio**: helper puro por regex, testável sem depender do pacote, permitindo estado de erro determinístico quando a URL é inválida.
- **Catálogo como `const List<Tutorial>`**: adicionar/editar tutorial exige mexer apenas na lista de dados; a UI itera sobre ela.
- **Simetria de índices**: branch de `/tutorials` inserido antes de `/settings` para casar com a ordem da `NavigationBar`.

### Deviations from Plan

Nenhuma. URLs dos 2 vídeos permanecem como placeholders embarcáveis, sinalizados
com `// TODO` para troca pelo usuário.

### Dependencies Added

- [x] `youtube_player_iframe` (^6.0.2) - player inline do YouTube (traz `webview_flutter` e `url_launcher` como transitivas).

### Developer Notes

- Android: permissão `INTERNET` já presente e `minSdk` usa o default do Flutter
  (21+), compatível com a WebView; nenhuma mudança de plataforma foi necessária.
- Build em Windows desktop pode exigir "Developer Mode" (symlink) — não afeta
  Android/iOS.
- Para trocar os vídeos, editar apenas `tutorials_catalog.dart`.
