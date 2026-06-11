import 'dart:async';

import 'package:conecta_geracao/features/notifications/data/notification_prefs_repository.dart';
import 'package:conecta_geracao/features/notifications/data/notifications_repository.dart';
import 'package:conecta_geracao/features/notifications/data/push_messaging_client.dart';
import 'package:conecta_geracao/features/notifications/domain/notification_analytics.dart';
import 'package:conecta_geracao/features/notifications/presentation/notifications_providers.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class NotificationPermissionState {
  const NotificationPermissionState({this.showPrompt = false});

  final bool showPrompt;

  NotificationPermissionState copyWith({bool? showPrompt}) {
    return NotificationPermissionState(
      showPrompt: showPrompt ?? this.showPrompt,
    );
  }
}

class NotificationPermissionController
    extends Notifier<NotificationPermissionState> {
  bool _promptOfferedThisSession = false;
  bool _firstAssistantReplyHandled = false;
  void Function(bool granted)? _settingsPermissionCallback;

  @override
  NotificationPermissionState build() {
    ref.onDispose(() {
      _settingsPermissionCallback?.call(false);
      _settingsPermissionCallback = null;
    });
    return const NotificationPermissionState();
  }

  NotificationPrefsRepository get _prefs =>
      ref.read(notificationPrefsRepositoryProvider);

  NotificationsRepository get _repository =>
      ref.read(notificationsRepositoryProvider);

  PushMessagingClient get _pushClient => ref.read(pushMessagingClientProvider);

  NotificationAnalytics get _analytics =>
      ref.read(notificationAnalyticsProvider);

  void offerPermissionFromSettings(void Function(bool granted) onComplete) {
    _settingsPermissionCallback = onComplete;
    state = state.copyWith(showPrompt: true);
  }

  Future<void> onFirstAssistantReply() async {
    if (_firstAssistantReplyHandled || _promptOfferedThisSession) {
      return;
    }
    _firstAssistantReplyHandled = true;

    final settings = await _pushClient.getNotificationSettings();
    if (settings.isAuthorized) {
      await _repository.syncTokenIfPermitted();
      return;
    }

    if (_promptOfferedThisSession) {
      return;
    }

    _promptOfferedThisSession = true;
    state = state.copyWith(showPrompt: true);
  }

  Future<void> acceptPrompt() async {
    state = state.copyWith(showPrompt: false);

    final settings = await _pushClient.requestPermission();
    if (settings.isAuthorized) {
      _analytics.permissionGranted();
      await _repository.syncTokenIfPermitted();
      _completeSettingsCallback(true);
      return;
    }

    _analytics.permissionDenied();
    await _prefs.markPermissionDeclined();
    _completeSettingsCallback(false);
  }

  void declinePrompt() {
    state = state.copyWith(showPrompt: false);
    _analytics.permissionDenied();
    unawaited(_prefs.markPermissionDeclined());
    _completeSettingsCallback(false);
  }

  void _completeSettingsCallback(bool granted) {
    final callback = _settingsPermissionCallback;
    _settingsPermissionCallback = null;
    callback?.call(granted);
  }

  void dismissPrompt() {
    state = state.copyWith(showPrompt: false);
  }
}

final notificationPermissionControllerProvider =
    NotifierProvider<
      NotificationPermissionController,
      NotificationPermissionState
    >(NotificationPermissionController.new);
