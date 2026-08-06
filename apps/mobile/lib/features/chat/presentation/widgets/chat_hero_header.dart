import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:conecta_geracao/features/chat/domain/tts_playback_state.dart';
import 'package:flutter/material.dart';

class ChatHeroHeader extends StatelessWidget {
  const ChatHeroHeader({
    this.onOpenHistory,
    this.autoTtsEnabled,
    this.onToggleAutoTts,
    super.key,
  });

  final VoidCallback? onOpenHistory;
  final bool? autoTtsEnabled;
  final VoidCallback? onToggleAutoTts;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final brand = context.brand;
    final showAutoTts = autoTtsEnabled != null && onToggleAutoTts != null;

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [AppColors.primary, AppColors.primaryDark],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.md,
            AppSpacing.sm,
            AppSpacing.md,
            AppSpacing.md,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Converse com o Conecta',
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: AppColors.onPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: AppSpacing.xs),
                    Text(
                      'Estou aqui pra te ajudar a evitar erros e usar a '
                      'tecnologia com mais segurança',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: AppColors.onPrimary.withValues(alpha: 0.92),
                        height: 1.35,
                      ),
                    ),
                    if (onOpenHistory != null) ...[
                      SizedBox(height: AppSpacing.sm),
                      Semantics(
                        button: true,
                        label: 'Abrir minhas conversas anteriores',
                        child: TextButton.icon(
                          onPressed: onOpenHistory,
                          icon: const Icon(
                            Icons.history,
                            color: AppColors.onPrimary,
                          ),
                          label: const Text('Minhas conversas'),
                          style: TextButton.styleFrom(
                            foregroundColor: AppColors.onPrimary,
                            padding: EdgeInsets.zero,
                            alignment: Alignment.centerLeft,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (showAutoTts) ...[
                SizedBox(width: AppSpacing.xs),
                Semantics(
                  button: true,
                  toggled: autoTtsEnabled!,
                  label: autoTtsSemanticLabel(autoTtsEnabled!),
                  child: IconButton(
                    onPressed: onToggleAutoTts,
                    tooltip: autoTtsEnabled!
                        ? TtsPlaybackMessages.autoTtsToggleTooltipOn
                        : TtsPlaybackMessages.autoTtsToggleTooltipOff,
                    icon: Icon(
                      autoTtsEnabled!
                          ? Icons.record_voice_over
                          : Icons.voice_over_off,
                      color: AppColors.onPrimary,
                    ),
                    style: IconButton.styleFrom(
                      minimumSize: const Size(
                        AppSpacing.minTouchTarget,
                        AppSpacing.minTouchTarget,
                      ),
                    ),
                  ),
                ),
              ],
              SizedBox(width: AppSpacing.sm),
              Semantics(
                label: 'Assistente Conecta',
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: AppColors.onPrimary,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: brand.cardShadow,
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: Image.asset(
                      'assets/images/robo.png',
                      fit: BoxFit.cover,
                      semanticLabel: '',
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
