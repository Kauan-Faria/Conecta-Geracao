import 'package:conecta_geracao/features/notifications/data/notifications_repository.dart';
import 'package:conecta_geracao/features/notifications/domain/notification_analytics.dart';
import 'package:conecta_geracao/features/notifications/presentation/notification_deep_link_handler.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

void main() {
  testWidgets('navigate emits analytics and routes to chat', (tester) async {
    final analytics = _RecordingAnalytics();
    final handler = NotificationDeepLinkHandler(analytics: analytics);
    final router = GoRouter(
      routes: [
        GoRoute(path: '/', builder: (_, _) => const SizedBox()),
        GoRoute(path: '/home', builder: (_, _) => const SizedBox()),
        GoRoute(path: '/chat', builder: (_, _) => const SizedBox()),
      ],
    );

    await tester.pumpWidget(
      MaterialApp.router(routerConfig: router),
    );
    await tester.pumpAndSettle();

    handler.navigate(
      router: router,
      payload: const RemoteMessagePayload({
        'type': 'ai_response',
        'route': '/conversations/conv-1',
        'conversationId': 'conv-1',
      }),
    );

    expect(analytics.openedEvents, hasLength(1));
    expect(analytics.openedEvents.first.type, 'ai_response');
    expect(analytics.openedEvents.first.route, 'chat');
    expect(router.routeInformationProvider.value.uri.toString(), contains('/chat'));
  });
}

class _RecordingAnalytics extends NotificationAnalytics {
  final openedEvents = <({String type, String route})>[];

  @override
  void notificationOpened({required String type, required String route}) {
    openedEvents.add((type: type, route: route));
  }
}
