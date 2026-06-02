enum AppFontScale {
  normal,
  large,
  extraLarge;

  String get label {
    switch (this) {
      case AppFontScale.normal:
        return 'Normal';
      case AppFontScale.large:
        return 'Grande';
      case AppFontScale.extraLarge:
        return 'Extra grande';
    }
  }

  double get multiplier {
    switch (this) {
      case AppFontScale.normal:
        return 1.0;
      case AppFontScale.large:
        return 1.2;
      case AppFontScale.extraLarge:
        return 1.4;
    }
  }

  static AppFontScale fromString(String value) {
    return AppFontScale.values.firstWhere(
      (scale) => scale.name == value,
      orElse: () => AppFontScale.normal,
    );
  }
}

class AccessibilityPrefs {
  const AccessibilityPrefs({
    this.fontScale = AppFontScale.normal,
    this.highContrast = false,
    this.reducedDensity = false,
  });

  final AppFontScale fontScale;
  final bool highContrast;
  final bool reducedDensity;

  double get spacingMultiplier => reducedDensity ? 0.85 : 1.0;

  AccessibilityPrefs copyWith({
    AppFontScale? fontScale,
    bool? highContrast,
    bool? reducedDensity,
  }) {
    return AccessibilityPrefs(
      fontScale: fontScale ?? this.fontScale,
      highContrast: highContrast ?? this.highContrast,
      reducedDensity: reducedDensity ?? this.reducedDensity,
    );
  }

  @override
  bool operator ==(Object other) {
    return other is AccessibilityPrefs &&
        other.fontScale == fontScale &&
        other.highContrast == highContrast &&
        other.reducedDensity == reducedDensity;
  }

  @override
  int get hashCode => Object.hash(fontScale, highContrast, reducedDensity);
}
