import 'package:shared_preferences/shared_preferences.dart';

abstract class GuestSessionRepository {
  Future<void> enableGuestSession();

  bool isGuestSessionActive();

  DateTime? getGuestSessionStartedAt();

  Future<void> clearGuestSession();
}

/// Guest session lives only in memory for the current app visit.
class InMemoryGuestSessionRepository implements GuestSessionRepository {
  DateTime? _startedAt;

  @override
  Future<void> enableGuestSession() async {
    _startedAt = DateTime.now();
  }

  @override
  DateTime? getGuestSessionStartedAt() => _startedAt;

  @override
  bool isGuestSessionActive() => _startedAt != null;

  @override
  Future<void> clearGuestSession() async {
    _startedAt = null;
  }
}

/// Removes legacy guest keys written by older app versions.
class GuestSessionLegacyCleaner {
  GuestSessionLegacyCleaner(this._prefs);

  final SharedPreferences _prefs;

  static const guestSessionStartedAtKey = 'guest_session_started_at';
  static const historyKey = 'guest_history_entries';

  Future<void> clearLegacyGuestData() async {
    await _prefs.remove(guestSessionStartedAtKey);
    await _prefs.remove(historyKey);
  }
}
