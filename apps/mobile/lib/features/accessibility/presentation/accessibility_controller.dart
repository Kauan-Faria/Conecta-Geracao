import 'package:conecta_geracao/features/accessibility/data/accessibility_prefs_repository.dart';
import 'package:conecta_geracao/features/accessibility/domain/accessibility_prefs.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be overridden at startup.');
});

final accessibilityPrefsRepositoryProvider =
    Provider<AccessibilityPrefsRepository>((ref) {
      return SharedPreferencesAccessibilityRepository(
        ref.watch(sharedPreferencesProvider),
      );
    });

class AccessibilityController extends Notifier<AccessibilityPrefs> {
  @override
  AccessibilityPrefs build() {
    _loadPrefs();
    return const AccessibilityPrefs();
  }

  Future<void> _loadPrefs() async {
    final prefs = await ref.read(accessibilityPrefsRepositoryProvider).load();
    state = prefs;
  }

  Future<void> setFontScale(AppFontScale fontScale) async {
    final updated = state.copyWith(fontScale: fontScale);
    state = updated;
    await ref.read(accessibilityPrefsRepositoryProvider).save(updated);
  }

  Future<void> setHighContrast(bool value) async {
    final updated = state.copyWith(highContrast: value);
    state = updated;
    await ref.read(accessibilityPrefsRepositoryProvider).save(updated);
  }

  Future<void> setReducedDensity(bool value) async {
    final updated = state.copyWith(reducedDensity: value);
    state = updated;
    await ref.read(accessibilityPrefsRepositoryProvider).save(updated);
  }
}

final accessibilityControllerProvider =
    NotifierProvider<AccessibilityController, AccessibilityPrefs>(
      AccessibilityController.new,
    );
