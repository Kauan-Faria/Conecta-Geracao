import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/core/network/connectivity_service.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/notifications/data/notification_prefs_repository.dart';
import 'package:conecta_geracao/features/notifications/data/notifications_repository.dart';
import 'package:conecta_geracao/features/notifications/domain/device_platform.dart';
import 'package:conecta_geracao/features/notifications/domain/notification_analytics.dart';
import 'package:conecta_geracao/features/notifications/presentation/notification_preference_controller.dart';
import 'package:conecta_geracao/features/notifications/presentation/notifications_providers.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_auth_repository.dart';
import 'notifications_repository_test.dart';

void main() {
  Future<void> waitForAuthenticated(ProviderContainer container) async {
    for (var attempt = 0; attempt < 20; attempt++) {
      if (container.read(authGateProvider).isAuthenticated) {
        return;
      }
      await Future<void>.delayed(Duration.zero);
    }
  }

  group('NotificationPreferenceController', () {
    test('loads enabled preference for authenticated user', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final api = FakeNotificationsRemotePort()..preferenceEnabled = false;

      final container = ProviderContainer(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          authRepositoryProvider.overrideWithValue(
            FakeAuthRepository(initialUser: authenticatedTestUser),
          ),
          notificationsApiProvider.overrideWithValue(api),
        ],
      );
      addTearDown(container.dispose);

      await waitForAuthenticated(container);
      await container.read(notificationPreferenceControllerProvider.future);

      expect(container.read(notificationPreferenceControllerProvider).value, isFalse);
      expect(api.getPreferenceCalls, 1);
    });

    test('setEnabled false updates backend preference', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final api = FakeNotificationsRemotePort()..preferenceEnabled = true;

      final container = ProviderContainer(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          authRepositoryProvider.overrideWithValue(
            FakeAuthRepository(initialUser: authenticatedTestUser),
          ),
          notificationsApiProvider.overrideWithValue(api),
        ],
      );
      addTearDown(container.dispose);

      await waitForAuthenticated(container);
      await container.read(notificationPreferenceControllerProvider.future);
      await container
          .read(notificationPreferenceControllerProvider.notifier)
          .setEnabled(false);

      expect(api.updatePreferenceCalls, 1);
      expect(api.preferenceEnabled, isFalse);
      expect(container.read(notificationPreferenceControllerProvider).value, isFalse);
    });

    test('setEnabled true with OS permission syncs token', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final api = FakeNotificationsRemotePort();
      final pushClient = FakePushMessagingClient(authorized: true);

      final container = ProviderContainer(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          authRepositoryProvider.overrideWithValue(
            FakeAuthRepository(initialUser: authenticatedTestUser),
          ),
          notificationsApiProvider.overrideWithValue(api),
          pushMessagingClientProvider.overrideWithValue(pushClient),
          notificationsRepositoryProvider.overrideWithValue(
            NotificationsRepository(
              api: api,
              pushClient: pushClient,
              prefs: NotificationPrefsRepository(prefs),
              analytics: const NotificationAnalytics(),
              isAuthenticatedUser: () async => true,
              hasConnection: () async => true,
              currentPlatform: () => DevicePlatform.android,
            ),
          ),
          connectivityServiceProvider.overrideWithValue(
            _FakeConnectivityService(true),
          ),
        ],
      );
      addTearDown(container.dispose);

      await waitForAuthenticated(container);
      await container.read(notificationPreferenceControllerProvider.future);
      await container
          .read(notificationPreferenceControllerProvider.notifier)
          .setEnabled(true);

      expect(api.updatePreferenceCalls, 1);
      expect(api.registerCalls, 1);
    });
  });
}

class _FakeConnectivityService extends ConnectivityService {
  _FakeConnectivityService(this._online) : super(Connectivity());

  final bool _online;

  @override
  Future<bool> hasConnection() async => _online;
}
