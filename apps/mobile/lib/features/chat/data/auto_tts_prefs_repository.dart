import 'package:shared_preferences/shared_preferences.dart';

/// Preferência local de leitura automática das respostas do assistente.
abstract class AutoTtsPrefsRepository {
  Future<bool> load({bool defaultValue = true});

  Future<void> save(bool enabled);
}

class SharedPreferencesAutoTtsPrefsRepository implements AutoTtsPrefsRepository {
  SharedPreferencesAutoTtsPrefsRepository(this._prefs);

  final SharedPreferences _prefs;

  static const key = 'chat_auto_tts_enabled';

  @override
  Future<bool> load({bool defaultValue = true}) async {
    return _prefs.getBool(key) ?? defaultValue;
  }

  @override
  Future<void> save(bool enabled) async {
    await _prefs.setBool(key, enabled);
  }
}
