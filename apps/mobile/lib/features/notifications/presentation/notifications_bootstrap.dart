import 'package:conecta_geracao/features/notifications/data/notifications_repository.dart';
import 'package:conecta_geracao/features/notifications/presentation/notification_navigation_coordinator.dart';
import 'package:conecta_geracao/features/notifications/presentation/notifications_providers.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class NotificationsBootstrap {
  NotificationsBootstrap({
    required this._repository,
    required this._navigationCoordinator,
  });

  final NotificationsRepository _repository;
  final NotificationNavigationCoordinator _navigationCoordinator;

  Future<void> initialize() async {
    try {
      _navigationCoordinator.initialize();
      await _repository.initializeListeners();
      await _navigationCoordinator.processPendingNavigation();
      await _repository.syncTokenIfPermitted();
      await _repository.flushPendingToken();
    } catch (error, stackTrace) {
      if (kDebugMode) {
        debugPrint('[NotificationsBootstrap] init failed: $error');
        debugPrint('$stackTrace');
      }
    }
  }
}

final notificationsBootstrapProvider = FutureProvider<void>((ref) async {
  final bootstrap = NotificationsBootstrap(
    repository: ref.watch(notificationsRepositoryProvider),
    navigationCoordinator: ref.watch(notificationNavigationCoordinatorProvider),
  );
  await bootstrap.initialize();
});
