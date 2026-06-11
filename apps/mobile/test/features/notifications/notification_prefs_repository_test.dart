import 'package:conecta_geracao/features/notifications/data/notification_prefs_repository.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('NotificationPrefsRepository', () {
    test('stores and clears pending token', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final repository = NotificationPrefsRepository(prefs);

      expect(repository.pendingToken, isNull);

      await repository.setPendingToken('token-abc');
      expect(repository.pendingToken, 'token-abc');

      await repository.clearPendingToken();
      expect(repository.pendingToken, isNull);
    });

    test('tracks permission declined flag', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final repository = NotificationPrefsRepository(prefs);

      expect(repository.wasPermissionDeclined, isFalse);

      await repository.markPermissionDeclined();
      expect(repository.wasPermissionDeclined, isTrue);
    });

    test('stores last synced token', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final repository = NotificationPrefsRepository(prefs);

      await repository.setLastSyncedToken('synced-token');
      expect(repository.lastSyncedToken, 'synced-token');

      await repository.clearLastSyncedToken();
      expect(repository.lastSyncedToken, isNull);
    });
  });
}
