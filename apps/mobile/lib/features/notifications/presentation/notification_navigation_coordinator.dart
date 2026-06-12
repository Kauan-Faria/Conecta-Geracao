import 'dart:async';

import 'package:conecta_geracao/core/routing/app_router.dart';
import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/features/notifications/data/notifications_repository.dart';
import 'package:conecta_geracao/features/notifications/presentation/notification_deep_link_handler.dart';
import 'package:conecta_geracao/features/notifications/presentation/notifications_providers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class ForegroundNotificationState {
  const ForegroundNotificationState({this.active});

  final ForegroundNotificationData? active;

  ForegroundNotificationState copyWith({
    ForegroundNotificationData? active,
    bool clearActive = false,
  }) {
    return ForegroundNotificationState(
      active: clearActive ? null : active ?? this.active,
    );
  }
}

class ForegroundNotificationData {
  const ForegroundNotificationData({
    required this.title,
    required this.body,
    required this.payload,
  });

  final String title;
  final String body;
  final RemoteMessagePayload payload;
}

class ForegroundNotificationController extends Notifier<ForegroundNotificationState> {
  Timer? _dismissTimer;

  @override
  ForegroundNotificationState build() {
    ref.onDispose(() => _dismissTimer?.cancel());
    return const ForegroundNotificationState();
  }

  void show(RemoteMessagePayload payload) {
    _dismissTimer?.cancel();
    state = ForegroundNotificationState(
      active: ForegroundNotificationData(
        title: payload.title,
        body: payload.body,
        payload: payload,
      ),
    );
    _dismissTimer = Timer(const Duration(seconds: 5), dismiss);
  }

  void dismiss() {
    _dismissTimer?.cancel();
    state = const ForegroundNotificationState();
  }
}

final foregroundNotificationControllerProvider =
    NotifierProvider<ForegroundNotificationController, ForegroundNotificationState>(
      ForegroundNotificationController.new,
    );

class NotificationNavigationCoordinator {
  NotificationNavigationCoordinator({
    required this._ref,
    required this._repository,
    required this._deepLinkHandler,
    required this._router,
  });

  final Ref _ref;
  final NotificationsRepository _repository;
  final NotificationDeepLinkHandler _deepLinkHandler;
  final GoRouter _router;

  RemoteMessagePayload? _pendingPayload;
  BuildContext? _messengerContext;

  void attachMessengerContext(BuildContext? context) {
    _messengerContext = context;
  }

  void initialize() {
    _repository.setForegroundMessageHandler(_handleForegroundMessage);
    _repository.setMessageOpenedHandler(_handleMessageOpened);

    _ref.listen(authGateProvider, (previous, next) {
      if (next.isAuthenticated && previous?.isAuthenticated != true) {
        unawaited(_processPendingNavigation());
      }
    });
  }

  void _handleForegroundMessage(RemoteMessagePayload payload) {
    _ref.read(foregroundNotificationControllerProvider.notifier).show(payload);
  }

  void _handleMessageOpened(RemoteMessagePayload payload) {
    unawaited(_navigate(payload));
  }

  Future<void> _processPendingNavigation() async {
    if (!_canNavigate()) {
      return;
    }

    final initial = _repository.consumeInitialMessage();
    if (initial != null) {
      await _navigate(initial);
      return;
    }

    final pending = _pendingPayload;
    if (pending != null) {
      _pendingPayload = null;
      await _navigate(pending);
    }
  }

  Future<void> _navigate(RemoteMessagePayload payload) async {
    if (!_canNavigate()) {
      _pendingPayload = payload;
      return;
    }

    _deepLinkHandler.navigate(
      router: _router,
      payload: payload,
      messengerContext: _messengerContext,
    );
  }

  Future<void> processPendingNavigation() => _processPendingNavigation();

  Future<void> openFromBanner(RemoteMessagePayload payload) async {
    _ref.read(foregroundNotificationControllerProvider.notifier).dismiss();
    await _navigate(payload);
  }

  bool _canNavigate() {
    final authGate = _ref.read(authGateProvider);
    final guestGate = _ref.read(guestSessionGateProvider);
    return authGate.isAuthenticated || guestGate.isGuestActive;
  }
}

final notificationDeepLinkHandlerProvider = Provider<NotificationDeepLinkHandler>((
  ref,
) {
  return NotificationDeepLinkHandler(
    analytics: ref.watch(notificationAnalyticsProvider),
  );
});

final notificationNavigationCoordinatorProvider =
    Provider<NotificationNavigationCoordinator>((ref) {
      return NotificationNavigationCoordinator(
        ref: ref,
        repository: ref.watch(notificationsRepositoryProvider),
        deepLinkHandler: ref.watch(notificationDeepLinkHandlerProvider),
        router: ref.watch(routerProvider),
      );
    });
