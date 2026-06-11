import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:flutter/material.dart';

enum AuthCtaVariant { primary, secondary }

enum AuthCtaIcon { forward, back }

/// Botão CTA padronizado do fluxo de autenticação (teal primário / azul secundário).
class AuthCtaButton extends StatelessWidget {
  const AuthCtaButton({
    required this.label,
    required this.onPressed,
    this.semanticLabel,
    this.variant = AuthCtaVariant.primary,
    this.icon = AuthCtaIcon.forward,
    this.isLoading = false,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final String? semanticLabel;
  final AuthCtaVariant variant;
  final AuthCtaIcon icon;
  final bool isLoading;

  Color get _backgroundColor => switch (variant) {
    AuthCtaVariant.primary => AppColors.primary,
    AuthCtaVariant.secondary => AppColors.secondaryCta,
  };

  IconData get _iconData => switch (icon) {
    AuthCtaIcon.forward => Icons.arrow_circle_right,
    AuthCtaIcon.back => Icons.arrow_circle_left,
  };

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null && !isLoading;

    return Semantics(
      button: true,
      label: semanticLabel ?? label,
      enabled: enabled,
      child: SizedBox(
        width: double.infinity,
        height: AppSpacing.minTouchTarget,
        child: FilledButton(
          onPressed: enabled ? onPressed : null,
          style: FilledButton.styleFrom(
            backgroundColor: _backgroundColor,
            foregroundColor: AppColors.onPrimary,
            disabledBackgroundColor: _backgroundColor.withValues(alpha: 0.5),
            disabledForegroundColor: AppColors.onPrimary.withValues(alpha: 0.7),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          ),
          child: isLoading
              ? const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppColors.onPrimary,
                  ),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Flexible(
                      child: Text(
                        label,
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: AppColors.onPrimary,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    SizedBox(width: AppSpacing.xs),
                    Icon(_iconData, size: 16),
                  ],
                ),
        ),
      ),
    );
  }
}
