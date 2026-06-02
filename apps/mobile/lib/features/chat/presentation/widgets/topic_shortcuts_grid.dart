import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:conecta_geracao/features/chat/domain/topic_shortcuts.dart';
import 'package:flutter/material.dart';

class TopicShortcutsGrid extends StatelessWidget {
  const TopicShortcutsGrid({
    required this.onTopicSelected,
    super.key,
  });

  final ValueChanged<TopicShortcut> onTopicSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Escolha um assunto para começar',
          style: theme.textTheme.bodyLarge?.copyWith(
            color: AppColors.onSurfaceVariant,
          ),
          textAlign: TextAlign.center,
        ),
        SizedBox(height: AppSpacing.md),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: AppSpacing.sm,
          crossAxisSpacing: AppSpacing.sm,
          childAspectRatio: 1.35,
          children: [
            for (final shortcut in mvpTopicShortcuts)
              _TopicShortcutCard(
                shortcut: shortcut,
                onTap: () => onTopicSelected(shortcut),
              ),
          ],
        ),
      ],
    );
  }
}

class _TopicShortcutCard extends StatelessWidget {
  const _TopicShortcutCard({
    required this.shortcut,
    required this.onTap,
  });

  final TopicShortcut shortcut;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final brand = context.brand;

    return Semantics(
      button: true,
      label: 'Iniciar conversa sobre ${shortcut.shortLabel}',
      child: Material(
        color: brand.cardBackground,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(brand.borderRadius),
          side: BorderSide(color: brand.cardBorder),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(brand.borderRadius),
          child: ConstrainedBox(
            constraints: const BoxConstraints(
              minHeight: AppSpacing.minTouchTarget,
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: AppSpacing.md,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    shortcut.icon,
                    color: AppColors.primary,
                    size: 28,
                    semanticLabel: shortcut.shortLabel,
                  ),
                  SizedBox(height: AppSpacing.xs),
                  Text(
                    shortcut.shortLabel,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.onSurface,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
