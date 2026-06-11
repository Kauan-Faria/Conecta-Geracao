import 'package:conecta_geracao/core/network/connectivity_service.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/notifications/data/notification_prefs_repository.dart';
import 'package:conecta_geracao/features/notifications/data/notifications_repository.dart';
import 'package:conecta_geracao/features/notifications/data/push_messaging_client.dart';
import 'package:conecta_geracao/features/notifications/domain/device_platform.dart';
import 'package:conecta_geracao/features/notifications/domain/notification_analytics.dart';
import 'package:conecta_geracao/features/notifications/presentation/notification_permission_controller.dart';
import 'package:conecta_geracao/features/notifications/presentation/notifications_providers.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_auth_repository.dart';
import 'notifications_repository_test.dart';

class FakePushMessagingClient implements PushMessagingClient {
  FakePushMessagingClient({this.isAuthorized = false});

  bool isAuthorized;

  @override
  Future<PushNotificationSettings> getNotificationSettings() async {
    return PushNotificationSettings(isAuthorized: isAuthorized);
  }

  @override
  Future<PushNotificationSettings> requestPermission() async {
    isAuthorized = true;
    return PushNotificationSettings(isAuthorized: true);
  }

  @override
  Future<String?> getToken() async => 'prompt-token';

  @override
  Stream<String> get onTokenRefresh => const Stream.empty();

  @override
  Future<RemoteMessage?> getInitialMessage() async => null;

  @override
  void listenToForegroundMessages(
    void Function(RemoteMessage message) handler,
  ) {}

  @override
  void listenToOpenedApp(void Function(RemoteMessage message) handler) {}
}

void main() {
  group('NotificationPermissionController', () {
    test(
      'shows prompt after first assistant reply when not authorized',
      () async {
        SharedPreferences.setMockInitialValues({});
        final prefs = await SharedPreferences.getInstance();
        final pushClient = FakePushMessagingClient();

        final container = ProviderContainer(
          overrides: [
            sharedPreferencesProvider.overrideWithValue(prefs),
            authRepositoryProvider.overrideWithValue(
              FakeAuthRepository(initialUser: authenticatedTestUser),
            ),
            pushMessagingClientProvider.overrideWithValue(pushClient),
            connectivityServiceProvider.overrideWithValue(
              _FakeConnectivityService(true),
            ),
          ],
        );
        addTearDown(container.dispose);

        final notifier = container.read(
          notificationPermissionControllerProvider.notifier,
        );

        await notifier.onFirstAssistantReply();

        expect(
          container.read(notificationPermissionControllerProvider).showPrompt,
          isTrue,
        );

        await notifier.onFirstAssistantReply();
        expect(
          container.read(notificationPermissionControllerProvider).showPrompt,
          isTrue,
        );
      },
    );

    test(
      'skips prompt when permission already authorized and syncs token',
      () async {
        SharedPreferences.setMockInitialValues({});
        final prefs = await SharedPreferences.getInstance();
        final pushClient = FakePushMessagingClient(isAuthorized: true);
        final api = FakeNotificationsRemotePort();

        final container = ProviderContainer(
          overrides: [
            sharedPreferencesProvider.overrideWithValue(prefs),
            authRepositoryProvider.overrideWithValue(
              FakeAuthRepository(initialUser: authenticatedTestUser),
            ),
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

        await container
            .read(notificationPermissionControllerProvider.notifier)
            .onFirstAssistantReply();

        expect(
          container.read(notificationPermissionControllerProvider).showPrompt,
          isFalse,
        );
        expect(api.registerCalls, 1);
      },
    );
  });
}

class _FakeConnectivityService extends ConnectivityService {
  _FakeConnectivityService(this._online) : super(Connectivity());

  final bool _online;

  @override
  Future<bool> hasConnection() async => _online;
}
