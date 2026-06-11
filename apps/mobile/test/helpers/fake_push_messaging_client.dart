import 'package:conecta_geracao/features/notifications/data/push_messaging_client.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class FakePushMessagingClient implements PushMessagingClient {
  FakePushMessagingClient({
    this.authorized = false,
    this.token,
  });

  final bool authorized;
  final String? token;

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
