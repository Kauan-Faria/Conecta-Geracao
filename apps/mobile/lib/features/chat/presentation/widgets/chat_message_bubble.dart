import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:conecta_geracao/features/chat/domain/chat_message.dart';
import 'package:conecta_geracao/features/maps/presentation/widgets/map_action_button.dart';
import 'package:flutter/material.dart';

class ChatMessageBubble extends StatelessWidget {
  const ChatMessageBubble({required this.message, this.onOpenMap, super.key});

  final ChatMessage message;
  final VoidCallback? onOpenMap;

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
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm + 2,
                  ),
                  decoration: BoxDecoration(
                    color: isUser ? AppColors.surface : AppColors.background,
                    borderRadius: BorderRadius.circular(brand.borderRadius + 4),
                    border: isUser ? null : Border.all(color: AppColors.border),
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
