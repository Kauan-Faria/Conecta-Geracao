import 'package:conecta_geracao/features/notifications/domain/notification_deep_link.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('NotificationDeepLink', () {
    test('maps conversationId to chat route', () {
      final target = NotificationDeepLink.fromPayload({
        'type': 'ai_response',
        'route': '/conversations/conv-1',
        'conversationId': 'conv-1',
      });

      expect(target.location, '/chat?conversationId=conv-1');
      expect(target.analyticsRoute, 'chat');
      expect(target.showNotFoundMessage, isFalse);
    });

    test('maps backend conversation path without explicit conversationId', () {
      final target = NotificationDeepLink.fromPayload({
        'type': 'reminder',
        'route': '/conversations/conv-abc',
      });

      expect(target.location, '/chat?conversationId=conv-abc');
      expect(target.analyticsRoute, 'chat');
    });

    test('maps home aliases', () {
      expect(
        NotificationDeepLink.fromPayload({'route': '/'}).location,
        '/home',
      );
      expect(
        NotificationDeepLink.fromPayload({'route': 'home'}).analyticsRoute,
        'home',
      );
    });

    test('maps maps route', () {
      final target = NotificationDeepLink.fromPayload({
        'route': '/maps?category=pharmacy',
      });

      expect(target.location, '/maps?category=pharmacy');
      expect(target.analyticsRoute, 'maps');
    });

    test('preserves chat query parameters', () {
      final target = NotificationDeepLink.fromPayload({
        'route': '/chat?topic=golpes',
      });

      expect(target.location, '/chat?topic=golpes');
      expect(target.analyticsRoute, 'chat');
    });

    test('returns home with message for invalid route', () {
      final target = NotificationDeepLink.fromPayload({
        'route': '%%%invalid%%%',
      });

      expect(target.location, '/home');
      expect(target.analyticsRoute, 'unknown');
      expect(target.showNotFoundMessage, isTrue);
    });

    test('reads notification type from payload', () {
      expect(
        NotificationDeepLink.notificationType({'type': 'campaign'}),
        'campaign',
      );
    });
  });
}
