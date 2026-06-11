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
  FirebasePushMessagingClient({FirebaseMessaging? messaging})
    : _messaging = messaging ?? FirebaseMessaging.instance;

  final FirebaseMessaging _messaging;

  @override
  Future<PushNotificationSettings> getNotificationSettings() async {
    final settings = await _messaging.getNotificationSettings();
    return PushNotificationSettings(
      isAuthorized: _isAuthorized(settings.authorizationStatus),
    );
  }

  @override
  Future<PushNotificationSettings> requestPermission() async {
    final settings = await _messaging.requestPermission();
    return PushNotificationSettings(
      isAuthorized: _isAuthorized(settings.authorizationStatus),
    );
  }

  @override
  Future<String?> getToken() => _messaging.getToken();

  @override
  Stream<String> get onTokenRefresh => _messaging.onTokenRefresh;

  @override
  Future<RemoteMessage?> getInitialMessage() => _messaging.getInitialMessage();

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
