import 'package:shared_preferences/shared_preferences.dart';

const _pendingTokenKey = 'notifications_pending_fcm_token';
const _lastSyncedTokenKey = 'notifications_last_synced_fcm_token';
const _permissionDeclinedKey = 'notifications_permission_declined';

class NotificationPrefsRepository {
  NotificationPrefsRepository(this._prefs);

  final SharedPreferences _prefs;

  String? get pendingToken => _prefs.getString(_pendingTokenKey);

  Future<void> setPendingToken(String token) async {
    await _prefs.setString(_pendingTokenKey, token);
  }

  Future<void> clearPendingToken() async {
    await _prefs.remove(_pendingTokenKey);
  }

  String? get lastSyncedToken => _prefs.getString(_lastSyncedTokenKey);

  Future<void> setLastSyncedToken(String token) async {
    await _prefs.setString(_lastSyncedTokenKey, token);
  }

  Future<void> clearLastSyncedToken() async {
    await _prefs.remove(_lastSyncedTokenKey);
  }

  bool get wasPermissionDeclined =>
      _prefs.getBool(_permissionDeclinedKey) ?? false;

  Future<void> markPermissionDeclined() async {
    await _prefs.setBool(_permissionDeclinedKey, true);
  }
}
