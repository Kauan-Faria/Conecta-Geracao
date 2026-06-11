import 'package:conecta_geracao/core/network/connectivity_service.dart';import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/notifications/data/notification_prefs_repository.dart';
import 'package:conecta_geracao/features/notifications/data/notifications_api.dart';
import 'package:conecta_geracao/features/notifications/data/notifications_repository.dart';
import 'package:conecta_geracao/features/notifications/data/push_messaging_client.dart';
import 'package:conecta_geracao/features/notifications/domain/notification_analytics.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final pushMessagingClientProvider = Provider<PushMessagingClient>((ref) {
  return FirebasePushMessagingClient();
});

final notificationPrefsRepositoryProvider =
    Provider<NotificationPrefsRepository>((ref) {
      return NotificationPrefsRepository(ref.watch(sharedPreferencesProvider));
    });

final notificationAnalyticsProvider = Provider<NotificationAnalytics>((ref) {
  return const NotificationAnalytics();
});

final notificationsApiProvider = Provider<NotificationsRemotePort>((ref) {
  return NotificationsApi(ref.watch(apiClientProvider));
});

final notificationsRepositoryProvider = Provider<NotificationsRepository>((
  ref,
) {
  final authGate = ref.watch(authGateProvider);
  final guestGate = ref.watch(guestSessionGateProvider);

  return NotificationsRepository(
    api: ref.watch(notificationsApiProvider),
    pushClient: ref.watch(pushMessagingClientProvider),
    prefs: ref.watch(notificationPrefsRepositoryProvider),
    analytics: ref.watch(notificationAnalyticsProvider),
    isAuthenticatedUser: () async {
      if (!authGate.isAuthenticated || guestGate.isGuestActive) {
        return false;
      }
      final token = await ref.read(authRepositoryProvider).getIdToken();
      return token != null;
    },
    hasConnection: () => ref.read(connectivityServiceProvider).hasConnection(),
  );
});
