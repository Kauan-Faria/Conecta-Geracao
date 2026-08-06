import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:conecta_geracao/features/chat/domain/chat_message.dart';
import 'package:conecta_geracao/features/chat/domain/tts_playback_state.dart';
import 'package:conecta_geracao/features/maps/presentation/widgets/map_action_button.dart';
import 'package:flutter/material.dart';

class ChatMessageBubble extends StatelessWidget {
  const ChatMessageBubble({
    required this.message,
    this.onOpenMap,
    this.showTtsControls = false,
    this.isSpeaking = false,
    this.onTtsAction,
    super.key,
  });

  final ChatMessage message;
  final VoidCallback? onOpenMap;
  final bool showTtsControls;
  final bool isSpeaking;
  final VoidCallback? onTtsAction;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final brand = context.brand;
    final isUser = message.role == MessageRole.user;

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Column(
        crossAxisAlignment: isUser
            ? CrossAxisAlignment.end
            : CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: isUser
                ? MainAxisAlignment.end
                : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (!isUser) ...[
                Semantics(
                  label: 'Assistente Conecta',
                  child: CircleAvatar(
                    radius: 18,
                    backgroundColor: AppColors.primaryLight,
                    child: ClipOval(
                      child: Image.asset(
                        'assets/images/robo.png',
                        width: 28,
                        height: 28,
                        fit: BoxFit.cover,
                        semanticLabel: '',
                      ),
                    ),
                  ),
                ),
                SizedBox(width: AppSpacing.sm),
              ],
              Flexible(
                child: AnimatedContainer(
                  key: isSpeaking
                      ? const ValueKey('tts-speaking-bubble')
                      : const ValueKey('tts-idle-bubble'),
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm + 2,
                  ),
                  decoration: BoxDecoration(
                    color: isUser
                        ? AppColors.surface
                        : (isSpeaking
                            ? AppColors.primaryLight
                            : AppColors.background),
                    borderRadius: BorderRadius.circular(brand.borderRadius + 4),
                    border: isUser
                        ? null
                        : Border.all(
                            color: isSpeaking
                                ? AppColors.primary
                                : AppColors.border,
                            width: isSpeaking ? 2 : 1,
                          ),
                  ),
                  child: Text(
                    message.content,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: AppColors.onSurface,
                      height: 1.4,
                    ),
                  ),
                ),
              ),
            ],
          ),
          if (!isUser && message.mapAction != null && onOpenMap != null)
            MapActionButton(
              mapAction: message.mapAction!,
              onPressed: onOpenMap!,
            ),
          if (!isUser && showTtsControls && onTtsAction != null)
            Padding(
              padding: const EdgeInsets.only(left: 52, top: AppSpacing.xs),
              child: Semantics(
                button: true,
                label: ttsActionSemanticLabel(
                  isSpeaking
                      ? TtsPlaybackStatus.speaking
                      : TtsPlaybackStatus.idle,
                  isActiveMessage: isSpeaking,
                ),
                child: TextButton.icon(
                  onPressed: onTtsAction,
                  icon: Icon(
                    isSpeaking ? Icons.stop_circle_outlined : Icons.volume_up,
                    size: 20,
                  ),
                  label: Text(
                    ttsActionButtonLabel(
                      isSpeaking
                          ? TtsPlaybackStatus.speaking
                          : TtsPlaybackStatus.idle,
                      isActiveMessage: isSpeaking,
                    ),
                  ),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    minimumSize: const Size(
                      AppSpacing.minTouchTarget,
                      AppSpacing.minTouchTarget,
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                    ),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
              ),
            ),
          SizedBox(height: AppSpacing.xs),
          Padding(
            padding: EdgeInsets.only(
              left: isUser ? 0 : 52,
              right: isUser ? AppSpacing.xs : 0,
            ),
            child: Text(
              _formatTime(message.createdAt),
              style: theme.textTheme.bodySmall?.copyWith(
                color: AppColors.onSurfaceMuted,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime dateTime) {
    final hour = dateTime.hour.toString().padLeft(2, '0');
    final minute = dateTime.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}
