import 'package:conecta_geracao/features/accessibility/domain/accessibility_prefs.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('AccessibilityPrefs', () {
    test('copyWith preserves unchanged fields', () {
      const prefs = AccessibilityPrefs(
        fontScale: AppFontScale.large,
        highContrast: true,
      );

      final updated = prefs.copyWith(reducedDensity: true);

      expect(updated.fontScale, AppFontScale.large);
      expect(updated.highContrast, isTrue);
      expect(updated.reducedDensity, isTrue);
    });

    test('font scale multipliers match labels', () {
      expect(AppFontScale.normal.multiplier, 1.0);
      expect(AppFontScale.large.multiplier, 1.2);
      expect(AppFontScale.extraLarge.multiplier, 1.4);
    });
  });
}
