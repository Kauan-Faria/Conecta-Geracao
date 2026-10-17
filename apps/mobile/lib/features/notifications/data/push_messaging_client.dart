import 'package:firebase_messaging/firebase_messaging.dart';

class PushNotificationSettings {
  const PushNotificationSettings({required this.isAuthorized});

  final bool isAuthorized;
}

abstract class PushMessagingClient {
  Future<PushNotificationSettings> getNotificationSettings();

  Future<PushNotificationSettings> requestPermission();

  Future<String?> getToken();

  Stream<String> get onTokenRefresh;

  Future<RemoteMessage?> getInitialMessage();

  void listenToOpenedApp(void Function(RemoteMessage message) handler);

  void listenToForegroundMessages(void Function(RemoteMessage message) handler);
}

class FirebasePushMessagingClient implements PushMessagingClient {
  FirebasePushMessagingClient([this._messaging]);

  FirebaseMessaging? _messaging;

  // Firebase is initialized by main() before the real application starts.
  // Keeping this lookup lazy also allows widgets and controllers to be tested
  // without requiring the native Firebase plugin to be bootstrapped.
  FirebaseMessaging get _instance =>
      _messaging ??= FirebaseMessaging.instance;

  @override
  Future<PushNotificationSettings> getNotificationSettings() async {
    final settings = await _instance.getNotificationSettings();
    return PushNotificationSettings(
      isAuthorized: _isAuthorized(settings.authorizationStatus),
    );
  }

  @override
  Future<PushNotificationSettings> requestPermission() async {
    final settings = await _instance.requestPermission();
    return PushNotificationSettings(
      isAuthorized: _isAuthorized(settings.authorizationStatus),
    );
  }

  @override
  Future<String?> getToken() => _instance.getToken();

  @override
  Stream<String> get onTokenRefresh => _instance.onTokenRefresh;

  @override
  Future<RemoteMessage?> getInitialMessage() => _instance.getInitialMessage();

  @override
  void listenToOpenedApp(void Function(RemoteMessage message) handler) {
    FirebaseMessaging.onMessageOpenedApp.listen(handler);
  }

  @override
  void listenToForegroundMessages(
    void Function(RemoteMessage message) handler,
  ) {
    FirebaseMessaging.onMessage.listen(handler);
  }

  bool _isAuthorized(AuthorizationStatus status) {
    return status == AuthorizationStatus.authorized ||
        status == AuthorizationStatus.provisional;
  }
}
