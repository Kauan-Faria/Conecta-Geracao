import 'package:conecta_geracao/features/auth/data/guest_session_repository.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract class GuestHistoryRepository {
  Future<List<String>> loadHistory();

  Future<void> saveHistory(List<String> entries);

  Future<void> clearIfExpired(GuestSessionRepository sessionRepository);
}

class SharedPreferencesGuestHistoryRepository implements GuestHistoryRepository {
  SharedPreferencesGuestHistoryRepository(this._prefs);

  final SharedPreferences _prefs;

  static const historyKey = 'guest_history_entries';

  @override
  Future<List<String>> loadHistory() async {
    return _prefs.getStringList(historyKey) ?? const [];
  }

  @override
  Future<void> saveHistory(List<String> entries) async {
    await _prefs.setStringList(historyKey, entries);
  }

  @override
  Future<void> clearIfExpired(GuestSessionRepository sessionRepository) async {
    if (!sessionRepository.isGuestSessionActive()) {
      await _prefs.remove(historyKey);
    }
  }
}
