import 'package:conecta_geracao/features/notifications/data/notifications_repository.dart';
import 'package:conecta_geracao/features/notifications/domain/notification_analytics.dart';
import 'package:conecta_geracao/features/notifications/domain/notification_deep_link.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class NotificationDeepLinkHandler {
  NotificationDeepLinkHandler({required this._analytics});

  final NotificationAnalytics _analytics;

  NotificationNavigationResult navigate({
    required GoRouter router,
    required RemoteMessagePayload payload,
    BuildContext? messengerContext,
  }) {
    final target = NotificationDeepLink.fromPayload(payload.data);
    final type = NotificationDeepLink.notificationType(payload.data);

    router.go(target.location);

    _analytics.notificationOpened(type: type, route: target.analyticsRoute);

    if (target.showNotFoundMessage && messengerContext != null) {
      _showNotFoundSnackBar(messengerContext);
    }

    return NotificationNavigationResult(
      target: target,
      notificationType: type,
    );
  }

  void _showNotFoundSnackBar(BuildContext context) {
    final messenger = ScaffoldMessenger.maybeOf(context);
    messenger?.showSnackBar(
      const SnackBar(
        content: Text('Não foi possível abrir o conteúdo. Você está na tela inicial.'),
      ),
    );
  }
}

class NotificationNavigationResult {
  const NotificationNavigationResult({
    required this.target,
    required this.notificationType,
  });

  final NotificationTarget target;
  final String notificationType;
}
