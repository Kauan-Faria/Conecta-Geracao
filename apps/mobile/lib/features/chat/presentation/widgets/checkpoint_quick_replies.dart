import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:flutter/material.dart';

class CheckpointQuickReplies extends StatelessWidget {
  const CheckpointQuickReplies({
    required this.onSim,
    required this.onNao,
    super.key,
  });

  final VoidCallback onSim;
  final VoidCallback onNao;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        children: [
          Expanded(
            child: _QuickReplyButton(
              label: 'Sim',
              semanticLabel: 'Sim, consegui fazer',
              backgroundColor: AppColors.primaryLight,
              foregroundColor: AppColors.primaryDark,
              borderColor: AppColors.primary,
              onPressed: onSim,
            ),
          ),
          SizedBox(width: AppSpacing.sm),
          Expanded(
            child: _QuickReplyButton(
              label: 'Não',
              semanticLabel: 'Não, ainda não consegui',
              backgroundColor: AppColors.background,
              foregroundColor: AppColors.onSurface,
              borderColor: AppColors.border,
              onPressed: onNao,
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickReplyButton extends StatelessWidget {
  const _QuickReplyButton({
    required this.label,
    required this.semanticLabel,
    required this.backgroundColor,
    required this.foregroundColor,
    required this.borderColor,
    required this.onPressed,
  });

  final String label;
  final String semanticLabel;
  final Color backgroundColor;
  final Color foregroundColor;
  final Color borderColor;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Semantics(
      button: true,
      label: semanticLabel,
      child: SizedBox(
        height: AppSpacing.minTouchTarget,
        child: OutlinedButton(
          onPressed: onPressed,
          style: OutlinedButton.styleFrom(
            backgroundColor: backgroundColor,
            foregroundColor: foregroundColor,
            side: BorderSide(color: borderColor, width: 1.5),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(context.brand.borderRadius),
            ),
          ),
          child: Text(
            label,
            style: theme.textTheme.labelLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}
