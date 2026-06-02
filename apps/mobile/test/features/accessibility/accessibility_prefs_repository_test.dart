import 'package:conecta_geracao/features/accessibility/data/accessibility_prefs_repository.dart';
import 'package:conecta_geracao/features/accessibility/domain/accessibility_prefs.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('SharedPreferencesAccessibilityRepository', () {
    late SharedPreferences prefs;
    late SharedPreferencesAccessibilityRepository repository;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      prefs = await SharedPreferences.getInstance();
      repository = SharedPreferencesAccessibilityRepository(prefs);
    });

    test('load returns defaults when empty', () async {
      final loaded = await repository.load();

      expect(loaded.fontScale, AppFontScale.normal);
      expect(loaded.highContrast, isFalse);
      expect(loaded.reducedDensity, isFalse);
    });

    test('save and load round-trip', () async {
      const updated = AccessibilityPrefs(
        fontScale: AppFontScale.extraLarge,
        highContrast: true,
        reducedDensity: true,
      );

      await repository.save(updated);
      final loaded = await repository.load();

      expect(loaded, updated);
    });
  });
}
