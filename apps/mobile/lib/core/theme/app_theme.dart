import 'package:conecta_geracao/core/theme/accessibility_extension.dart';
import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_typography.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:conecta_geracao/features/accessibility/domain/accessibility_prefs.dart';
import 'package:flutter/material.dart';

ThemeData buildAppTheme(AccessibilityPrefs prefs) {
  final highContrast = prefs.highContrast;
  final fontScale = prefs.fontScale.multiplier;

  final colorScheme = highContrast
      ? const ColorScheme.dark(
          primary: AppColors.highContrastPrimary,
          onPrimary: AppColors.highContrastOnPrimary,
          surface: AppColors.highContrastSurface,
          onSurface: AppColors.onSurfaceHighContrast,
          error: AppColors.error,
        )
      : const ColorScheme.light(
          primary: AppColors.primary,
          onPrimary: AppColors.onPrimary,
          primaryContainer: AppColors.primaryLight,
          onPrimaryContainer: AppColors.primaryDark,
          secondary: AppColors.accent,
          onSecondary: AppColors.onPrimary,
          surface: AppColors.surface,
          onSurface: AppColors.onSurface,
          onSurfaceVariant: AppColors.onSurfaceVariant,
          outline: AppColors.border,
          error: AppColors.error,
          onError: AppColors.onError,
        );

  return ThemeData(
    useMaterial3: true,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: highContrast
        ? AppColors.highContrastBackground
        : AppColors.surface,
    textTheme: AppTypography.textTheme(scale: fontScale),
    dividerColor: highContrast ? AppColors.highContrastOnSurface : AppColors.divider,
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: colorScheme.primary,
        foregroundColor: colorScheme.onPrimary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(BrandTheme.standard.borderRadius),
        ),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: colorScheme.primary,
      ),
    ),
    extensions: [
      AccessibilityTheme(prefs: prefs, spacingScale: prefs.spacingMultiplier),
      highContrast ? BrandTheme.highContrast : BrandTheme.standard,
    ],
    navigationBarTheme: NavigationBarThemeData(
      height: 72,
      labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
      indicatorColor: AppColors.primaryLight,
    ),
  );
}
