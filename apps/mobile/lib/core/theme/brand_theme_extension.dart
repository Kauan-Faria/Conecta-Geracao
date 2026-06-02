import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:flutter/material.dart';

/// Tokens de marca expostos via [Theme.of(context).extension].
///
/// Complementa [ColorScheme] com cores específicas do design system
/// (cards, bordas, links, superfícies decorativas).
class BrandTheme extends ThemeExtension<BrandTheme> {
  const BrandTheme({
    required this.cardBackground,
    required this.cardBorder,
    required this.cardShadow,
    required this.divider,
    required this.accentSurface,
    required this.link,
    required this.subtitle,
    required this.borderRadius,
  });

  final Color cardBackground;
  final Color cardBorder;
  final Color cardShadow;
  final Color divider;
  final Color accentSurface;
  final Color link;
  final Color subtitle;
  final double borderRadius;

  static const standard = BrandTheme(
    cardBackground: AppColors.surfaceContainer,
    cardBorder: AppColors.border,
    cardShadow: AppColors.shadow,
    divider: AppColors.divider,
    accentSurface: AppColors.primaryLight,
    link: AppColors.primary,
    subtitle: AppColors.onSurfaceVariant,
    borderRadius: 12,
  );

  static const highContrast = BrandTheme(
    cardBackground: AppColors.highContrastSurface,
    cardBorder: AppColors.highContrastOnSurface,
    cardShadow: Colors.transparent,
    divider: AppColors.highContrastOnSurface,
    accentSurface: AppColors.highContrastSurface,
    link: AppColors.highContrastPrimary,
    subtitle: AppColors.highContrastOnSurface,
    borderRadius: 12,
  );

  @override
  BrandTheme copyWith({
    Color? cardBackground,
    Color? cardBorder,
    Color? cardShadow,
    Color? divider,
    Color? accentSurface,
    Color? link,
    Color? subtitle,
    double? borderRadius,
  }) {
    return BrandTheme(
      cardBackground: cardBackground ?? this.cardBackground,
      cardBorder: cardBorder ?? this.cardBorder,
      cardShadow: cardShadow ?? this.cardShadow,
      divider: divider ?? this.divider,
      accentSurface: accentSurface ?? this.accentSurface,
      link: link ?? this.link,
      subtitle: subtitle ?? this.subtitle,
      borderRadius: borderRadius ?? this.borderRadius,
    );
  }

  @override
  BrandTheme lerp(ThemeExtension<BrandTheme>? other, double t) {
    if (other is! BrandTheme) {
      return this;
    }
    return t < 0.5 ? this : other;
  }
}

extension BrandThemeContext on BuildContext {
  BrandTheme get brand =>
      Theme.of(this).extension<BrandTheme>() ?? BrandTheme.standard;
}
