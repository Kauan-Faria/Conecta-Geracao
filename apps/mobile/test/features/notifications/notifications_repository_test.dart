import 'package:conecta_geracao/core/network/api_exception.dart';
import 'package:conecta_geracao/features/notifications/data/notification_prefs_repository.dart';
import 'package:conecta_geracao/features/notifications/data/notifications_api.dart';
import 'package:conecta_geracao/features/notifications/data/notifications_repository.dart';
import 'package:conecta_geracao/features/notifications/data/push_messaging_client.dart';
import 'package:conecta_geracao/features/notifications/domain/device_platform.dart';
import 'package:conecta_geracao/features/notifications/domain/notification_analytics.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

class FakePushMessagingClient implements PushMessagingClient {
  FakePushMessagingClient({
    this.authorized = true,
    this.token = 'fake-fcm-token',
  });

  bool authorized;
  String? token;

  @override
  Future<PushNotificationSettings> getNotificationSettings() async {
    return PushNotificationSettings(isAuthorized: authorized);
  }

  @override
  Future<PushNotificationSettings> requestPermission() async {
    return PushNotificationSettings(isAuthorized: authorized);
  }

  @override
  Future<String?> getToken() async => token;

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

class FakeNotificationsRemotePort implements NotificationsRemotePort {
  int registerCalls = 0;
  int deactivateCalls = 0;
  int getPreferenceCalls = 0;
  int updatePreferenceCalls = 0;
  String? lastRegisteredToken;
  DevicePlatform? lastPlatform;
  bool preferenceEnabled = true;
  ApiException? registerError;
  ApiException? updatePreferenceError;

  @override
  Future<void> registerDeviceToken({
    required String token,
    required DevicePlatform platform,
  }) async {
    registerCalls++;
    lastRegisteredToken = token;
    lastPlatform = platform;
    if (registerError != null) {
      throw registerError!;
    }
  }

  @override
  Future<void> deactivateDeviceToken({required String token}) async {
    deactivateCalls++;
  }

  @override
  Future<NotificationPreferenceResponse> getPreference() async {
    getPreferenceCalls++;
    return NotificationPreferenceResponse(
      enabled: preferenceEnabled,
      updatedAt: DateTime.utc(2026, 6, 10),
    );
  }

  @override
  Future<NotificationPreferenceResponse> updatePreference({
    required bool enabled,
  }) async {
    updatePreferenceCalls++;
    if (updatePreferenceError != null) {
      throw updatePreferenceError!;
    }
    preferenceEnabled = enabled;
    return NotificationPreferenceResponse(
      enabled: enabled,
      updatedAt: DateTime.utc(2026, 6, 10),
    );
  }
}

void main() {
  group('NotificationsRepository', () {
    late NotificationPrefsRepository prefsRepository;
    late FakePushMessagingClient pushClient;
    late FakeNotificationsRemotePort api;
    late NotificationsRepository repository;
    var authenticated = true;
    var online = true;
    var analyticsEvents = <String>[];

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      prefsRepository = NotificationPrefsRepository(prefs);
      pushClient = FakePushMessagingClient();
      api = FakeNotificationsRemotePort();
      authenticated = true;
      online = true;
      analyticsEvents = [];

      repository = NotificationsRepository(
        api: api,
        pushClient: pushClient,
        prefs: prefsRepository,
        analytics: _RecordingAnalytics(analyticsEvents),
        isAuthenticatedUser: () async => authenticated,
        hasConnection: () async => online,
        currentPlatform: () => DevicePlatform.android,
      );
    });

    test('syncToken registers token for authenticated online user', () async {
      final synced = await repository.syncToken('token-123');

      expect(synced, isTrue);
      expect(api.registerCalls, 1);
      expect(api.lastRegisteredToken, 'token-123');
      expect(prefsRepository.lastSyncedToken, 'token-123');
      expect(analyticsEvents, contains('notification_token_registered'));
    });

    test('syncToken skips guest/unauthenticated users', () async {
      authenticated = false;

      final synced = await repository.syncToken('token-123');

      expect(synced, isFalse);
      expect(api.registerCalls, 0);
    });

    test('syncToken stores pending token when offline', () async {
      online = false;

      final synced = await repository.syncToken('token-offline');

      expect(synced, isFalse);
      expect(api.registerCalls, 0);
      expect(prefsRepository.pendingToken, 'token-offline');
    });

    test('syncToken ignores 401 responses', () async {
      api.registerError = const ApiException(
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      );

      final synced = await repository.syncToken('token-401');

      expect(synced, isFalse);
      expect(prefsRepository.pendingToken, isNull);
    });

    test('deactivateCurrentToken calls API with last synced token', () async {
      await prefsRepository.setLastSyncedToken('token-logout');

      await repository.deactivateCurrentToken();

      expect(api.deactivateCalls, 1);
      expect(prefsRepository.lastSyncedToken, isNull);
    });
  });
}

class _RecordingAnalytics extends NotificationAnalytics {
  _RecordingAnalytics(this.events);

  final List<String> events;

  @override
  void tokenRegistered() {
    events.add('notification_token_registered');
  }
}
