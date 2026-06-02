import 'package:flutter/material.dart';

abstract final class AppTypography {
  static TextTheme textTheme({required double scale}) {
    final base = ThemeData.light().textTheme;
    return TextTheme(
      headlineLarge: base.headlineLarge?.copyWith(
        fontSize: 28 * scale,
        fontWeight: FontWeight.bold,
      ),
      headlineMedium: base.headlineMedium?.copyWith(
        fontSize: 24 * scale,
        fontWeight: FontWeight.w600,
      ),
      titleLarge: base.titleLarge?.copyWith(
        fontSize: 20 * scale,
        fontWeight: FontWeight.w600,
      ),
      bodyLarge: base.bodyLarge?.copyWith(fontSize: 18 * scale),
      bodyMedium: base.bodyMedium?.copyWith(fontSize: 16 * scale),
      labelLarge: base.labelLarge?.copyWith(
        fontSize: 16 * scale,
        fontWeight: FontWeight.w600,
      ),
    );
  }
}
