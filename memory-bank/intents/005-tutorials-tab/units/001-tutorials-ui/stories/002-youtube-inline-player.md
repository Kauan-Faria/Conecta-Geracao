---
id: 002-youtube-inline-player
unit: 001-tutorials-ui
intent: 005-tutorials-tab
status: complete
priority: must
created: 2026-07-20T20:57:00.000Z
assigned_bolt: 026-tutorials-ui
implemented: true
---

# Story: 002-youtube-inline-player

## User Story

**As a** usuário do app
**I want** assistir aos vídeos do YouTube dentro do próprio app
**So that** eu não precise sair para outro aplicativo para aprender

## Acceptance Criteria

- [ ] **Given** um tutorial com URL do YouTube, **When** a página renderiza, **Then** o vídeo aparece em um player embutido (não abre app externo).
- [ ] **Given** o player carregado, **When** toco em play/pause, **Then** o vídeo reproduz e pausa dentro do app.
- [ ] **Given** uma URL do YouTube em formatos comuns (watch?v=, youtu.be/, embed/), **When** o player inicializa, **Then** o ID do vídeo é extraído corretamente.
- [ ] **Given** o player, **When** exibido, **Then** respeita a proporção 16:9 e a largura disponível.

## Technical Notes

- Adicionar `youtube_player_iframe` ao `apps/mobile/pubspec.yaml` (usar a última
  versão estável via `flutter pub add youtube_player_iframe`).
- Configurar plataformas conforme a lib (WebView): verificar `minSdkVersion` do
  Android e permissões/ATS do iOS se necessário.
- Criar um widget reutilizável (ex.: `TutorialVideoPlayer`) que recebe o
  `videoId`/URL e gerencia o `YoutubePlayerController`.
- Extração de `videoId` a partir da URL (helper no domain).

## Dependencies

### Requires
- None

### Enables
- 003-tutorials-catalog-list (usa o player para cada item)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Sem conexão de rede | Mostra estado de erro amigável, não quebra a tela |
| URL inválida / sem ID | Mostra erro; não trava a lista |
| Vídeo não permite embed | Mensagem de erro amigável |
| Múltiplos players na lista | Reprodução gerenciada sem vazamento de controllers |

## Out of Scope

- Controle de reprodução automática entre vídeos.
- Fullscreen customizado além do padrão da lib.
