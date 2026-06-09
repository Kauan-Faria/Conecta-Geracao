import 'package:shared_preferences/shared_preferences.dart';

abstract class GuestSessionRepository {
  Future<void> enableGuestSession();

  bool isGuestSessionActive();

  DateTime? getGuestSessionStartedAt();

  Future<void> clearGuestSession();

  Future<void> clearIfExpired();
}

class SharedPreferencesGuestSessionRepository
    implements GuestSessionRepository {
  SharedPreferencesGuestSessionRepository(this._prefs);

  final SharedPreferences _prefs;

  static const guestSessionStartedAtKey = 'guest_session_started_at';
  static const retentionDays = 7;

  @override
  Future<void> enableGuestSession() async {
    await _prefs.setInt(
      guestSessionStartedAtKey,
      DateTime.now().millisecondsSinceEpoch,
    );
  }

  @override
  DateTime? getGuestSessionStartedAt() {
    final millis = _prefs.getInt(guestSessionStartedAtKey);
    if (millis == null) {
      return null;
    }
    return DateTime.fromMillisecondsSinceEpoch(millis);
  }

  @override
  bool isGuestSessionActive() {
    final startedAt = getGuestSessionStartedAt();
    if (startedAt == null) {
      return false;
    }
    return DateTime.now().difference(startedAt).inDays < retentionDays;
  }

  @override
  Future<void> clearGuestSession() async {
    await _prefs.remove(guestSessionStartedAtKey);
  }

  @override
  Future<void> clearIfExpired() async {
    if (getGuestSessionStartedAt() != null && !isGuestSessionActive()) {
      await clearGuestSession();
    }
  }
}
