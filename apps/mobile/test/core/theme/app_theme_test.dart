import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_theme.dart';
import 'package:conecta_geracao/features/accessibility/domain/accessibility_prefs.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('buildAppTheme', () {
    test('uses standard palette by default', () {
      const prefs = AccessibilityPrefs();
      final theme = buildAppTheme(prefs);

      expect(theme.colorScheme.primary, AppColors.primary);
      expect(theme.scaffoldBackgroundColor, AppColors.surface);
    });

    test('applies high contrast palette when enabled', () {
      const prefs = AccessibilityPrefs(highContrast: true);
      final theme = buildAppTheme(prefs);

      expect(theme.colorScheme.primary, AppColors.highContrastPrimary);
      expect(theme.scaffoldBackgroundColor, AppColors.highContrastBackground);
    });

    test('scales typography with font preference', () {
      const normal = AccessibilityPrefs(fontScale: AppFontScale.normal);
      const extraLarge = AccessibilityPrefs(fontScale: AppFontScale.extraLarge);

      final normalTheme = buildAppTheme(normal);
      final extraLargeTheme = buildAppTheme(extraLarge);

      expect(
        extraLargeTheme.textTheme.bodyLarge!.fontSize,
        greaterThan(normalTheme.textTheme.bodyLarge!.fontSize!),
      );
    });
  });
}
