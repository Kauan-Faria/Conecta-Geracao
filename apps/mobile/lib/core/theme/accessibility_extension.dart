import 'package:conecta_geracao/features/accessibility/domain/accessibility_prefs.dart';
import 'package:flutter/material.dart';

class AccessibilityTheme extends ThemeExtension<AccessibilityTheme> {
  const AccessibilityTheme({required this.prefs, required this.spacingScale});

  final AccessibilityPrefs prefs;
  final double spacingScale;

  @override
  AccessibilityTheme copyWith({
    AccessibilityPrefs? prefs,
    double? spacingScale,
  }) {
    return AccessibilityTheme(
      prefs: prefs ?? this.prefs,
      spacingScale: spacingScale ?? this.spacingScale,
    );
  }

  @override
  AccessibilityTheme lerp(ThemeExtension<AccessibilityTheme>? other, double t) {
    if (other is! AccessibilityTheme) {
      return this;
    }
    return t < 0.5 ? this : other;
  }
}
