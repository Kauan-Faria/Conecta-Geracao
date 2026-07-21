import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/features/tutorials/domain/tutorial.dart';
import 'package:flutter/material.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';

/// Player inline do YouTube para um único tutorial.
///
/// Cria e gerencia um [YoutubePlayerController] por instância (liberado em
/// [dispose] para evitar vazamento quando há múltiplos players na lista) e
/// mantém a proporção 16:9. Quando a URL não contém um ID válido, exibe um
/// estado de erro amigável em vez de quebrar a tela.
class TutorialVideoPlayer extends StatefulWidget {
  const TutorialVideoPlayer({required this.youtubeUrl, super.key});

  final String youtubeUrl;

  @override
  State<TutorialVideoPlayer> createState() => _TutorialVideoPlayerState();
}

class _TutorialVideoPlayerState extends State<TutorialVideoPlayer> {
  YoutubePlayerController? _controller;

  @override
  void initState() {
    super.initState();
    final videoId = extractYoutubeVideoId(widget.youtubeUrl);
    if (videoId != null) {
      _controller = YoutubePlayerController.fromVideoId(
        videoId: videoId,
        autoPlay: false,
        params: const YoutubePlayerParams(
          showFullscreenButton: true,
          mute: false,
        ),
      );
    }
  }

  @override
  void dispose() {
    _controller?.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = _controller;

    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: AspectRatio(
        aspectRatio: 16 / 9,
        child: controller == null
            ? const _TutorialVideoError(
                message: 'Não foi possível carregar este vídeo.',
              )
            : YoutubePlayer(
                controller: controller,
                aspectRatio: 16 / 9,
              ),
      ),
    );
  }
}

class _TutorialVideoError extends StatelessWidget {
  const _TutorialVideoError({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Semantics(
      label: message,
      child: ColoredBox(
        color: theme.colorScheme.surfaceContainerHighest,
        child: Padding(
          padding: EdgeInsets.all(AppSpacing.md),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                color: theme.colorScheme.error,
              ),
              SizedBox(height: AppSpacing.sm),
              Text(
                message,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
