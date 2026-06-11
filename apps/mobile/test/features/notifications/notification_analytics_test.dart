import 'package:conecta_geracao/features/notifications/domain/notification_analytics.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('notificationOpened accepts only type and route labels', () {
    const analytics = NotificationAnalytics();

    expect(() {
      analytics.notificationOpened(type: 'ai_response', route: 'chat');
    }, returnsNormally);
  });
}
