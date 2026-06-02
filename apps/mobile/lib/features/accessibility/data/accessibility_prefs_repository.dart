import 'package:conecta_geracao/features/accessibility/domain/accessibility_prefs.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract class AccessibilityPrefsRepository {
  Future<AccessibilityPrefs> load();

  Future<void> save(AccessibilityPrefs prefs);
}

class SharedPreferencesAccessibilityRepository
    implements AccessibilityPrefsRepository {
  SharedPreferencesAccessibilityRepository(this._prefs);

  final SharedPreferences _prefs;

  static const _fontScaleKey = 'accessibility_font_scale';
  static const _highContrastKey = 'accessibility_high_contrast';
  static const _reducedDensityKey = 'accessibility_reduced_density';

  @override
  Future<AccessibilityPrefs> load() async {
    return AccessibilityPrefs(
      fontScale: AppFontScale.fromString(
        _prefs.getString(_fontScaleKey) ?? AppFontScale.normal.name,
      ),
      highContrast: _prefs.getBool(_highContrastKey) ?? false,
      reducedDensity: _prefs.getBool(_reducedDensityKey) ?? false,
    );
  }

  @override
  Future<void> save(AccessibilityPrefs prefs) async {
    await _prefs.setString(_fontScaleKey, prefs.fontScale.name);
    await _prefs.setBool(_highContrastKey, prefs.highContrast);
    await _prefs.setBool(_reducedDensityKey, prefs.reducedDensity);
  }
}
