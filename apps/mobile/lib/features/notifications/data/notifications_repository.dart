import 'package:conecta_geracao/core/network/api_exception.dart';
import 'package:conecta_geracao/features/notifications/data/notification_prefs_repository.dart';
import 'package:conecta_geracao/features/notifications/data/notifications_api.dart';
import 'package:conecta_geracao/features/notifications/data/push_messaging_client.dart';
import 'package:conecta_geracao/features/notifications/domain/device_platform.dart';
import 'package:conecta_geracao/features/notifications/domain/notification_analytics.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

typedef AuthenticatedUserChecker = Future<bool> Function();
typedef ConnectionChecker = Future<bool> Function();
typedef NotificationMessageHandler = void Function(RemoteMessagePayload message);

class NotificationsRepository {
  NotificationsRepository({
    required NotificationsRemotePort api,
    required PushMessagingClient pushClient,
    required NotificationPrefsRepository prefs,
    required NotificationAnalytics analytics,
    required AuthenticatedUserChecker isAuthenticatedUser,
    required ConnectionChecker hasConnection,
    DevicePlatform Function()? currentPlatform,
  }) : _api = api,
       _pushClient = pushClient,
       _prefs = prefs,
       _analytics = analytics,
       _isAuthenticatedUser = isAuthenticatedUser,
       _hasConnection = hasConnection,
       _currentPlatform = currentPlatform ?? currentDevicePlatform;

  final NotificationsRemotePort _api;
  final PushMessagingClient _pushClient;
  final NotificationPrefsRepository _prefs;
  final NotificationAnalytics _analytics;
  final AuthenticatedUserChecker _isAuthenticatedUser;
  final ConnectionChecker _hasConnection;
  final DevicePlatform Function() _currentPlatform;

  RemoteMessagePayload? _pendingInitialMessage;
  NotificationMessageHandler? _onForegroundMessage;
  NotificationMessageHandler? _onMessageOpened;

  RemoteMessagePayload? get pendingInitialMessage => _pendingInitialMessage;

  void setForegroundMessageHandler(NotificationMessageHandler? handler) {
    _onForegroundMessage = handler;
  }

  void setMessageOpenedHandler(NotificationMessageHandler? handler) {
    _onMessageOpened = handler;
  }

  RemoteMessagePayload? consumeInitialMessage() {
    final message = _pendingInitialMessage;
    _pendingInitialMessage = null;
    return message;
  }

  Future<void> initializeListeners() async {
    try {
      _pendingInitialMessage = await _captureInitialMessage();
    } catch (error, stackTrace) {
      _logFailure('initial_message', error, stackTrace);
    }

    _pushClient.onTokenRefresh.listen((token) {
      syncToken(token);
    });

    _pushClient.listenToOpenedApp((message) {
      final payload = RemoteMessagePayload.fromMessage(message);
      _logDataPayload('opened_app', message.data);
      _onMessageOpened?.call(payload);
    });

    _pushClient.listenToForegroundMessages((message) {
      final payload = RemoteMessagePayload.fromMessage(message);
      _logDataPayload('foreground', message.data);
      _onForegroundMessage?.call(payload);
    });
  }

  Future<void> syncTokenIfPermitted() async {
    try {
      final settings = await _pushClient.getNotificationSettings();
      if (!settings.isAuthorized) {
        return;
      }

      final token = await _pushClient.getToken();
      if (token == null || token.isEmpty) {
        return;
      }

      await syncToken(token);
    } catch (error, stackTrace) {
      _logFailure('sync_if_permitted', error, stackTrace);
    }
  }

  Future<bool> syncToken(String token) async {
    if (!await _isAuthenticatedUser()) {
      return false;
    }

    if (!await _hasConnection()) {
      await _prefs.setPendingToken(token);
      return false;
    }

    for (var attempt = 0; attempt < 3; attempt++) {
      try {
        await _api.registerDeviceToken(
          token: token,
          platform: _currentPlatform(),
        );
        await _prefs.setLastSyncedToken(token);
        await _prefs.clearPendingToken();
        _analytics.tokenRegistered();
        return true;
      } on ApiException catch (error) {
        if (error.statusCode == 401) {
          return false;
        }
        if (attempt == 2) {
          await _prefs.setPendingToken(token);
          return false;
        }
      } catch (_) {
        if (attempt == 2) {
          await _prefs.setPendingToken(token);
          return false;
        }
      }

      await Future<void>.delayed(Duration(milliseconds: 300 * (attempt + 1)));
    }

    return false;
  }

  Future<void> flushPendingToken() async {
    final pending = _prefs.pendingToken;
    if (pending == null || pending.isEmpty) {
      return;
    }
    await syncToken(pending);
  }

  Future<void> deactivateCurrentToken() async {
    if (!await _isAuthenticatedUser()) {
      return;
    }

    String? token = _prefs.lastSyncedToken;
    token ??= await _safeGetToken();
    if (token == null || token.isEmpty) {
      return;
    }

    if (!await _hasConnection()) {
      await _prefs.clearLastSyncedToken();
      await _prefs.clearPendingToken();
      return;
    }

    try {
      await _api.deactivateDeviceToken(token: token);
    } on ApiException catch (error) {
      if (error.statusCode != 401) {
        _logFailure('deactivate', error, StackTrace.current);
      }
    } catch (error, stackTrace) {
      _logFailure('deactivate', error, stackTrace);
    } finally {
      await _prefs.clearLastSyncedToken();
      await _prefs.clearPendingToken();
    }
  }

  Future<String?> _safeGetToken() async {
    try {
      return await _pushClient.getToken();
    } catch (_) {
      return null;
    }
  }

  Future<RemoteMessagePayload?> _captureInitialMessage() async {
    final message = await _pushClient.getInitialMessage();
    if (message == null) {
      return null;
    }
    _logDataPayload('initial_message', message.data);
    return RemoteMessagePayload.fromMessage(message);
  }

  void _logDataPayload(String source, Map<String, dynamic> data) {
    if (kDebugMode) {
      debugPrint('[NotificationsRepository] $source data=$data');
    }
  }

  void _logFailure(String action, Object error, StackTrace stackTrace) {
    if (kDebugMode) {
      debugPrint('[NotificationsRepository] $action failed: $error');
      debugPrint('$stackTrace');
    }
  }
}

class RemoteMessagePayload {
  const RemoteMessagePayload(
    this.data, {
    this.notificationTitle,
    this.notificationBody,
  });

  final Map<String, dynamic> data;
  final String? notificationTitle;
  final String? notificationBody;

  factory RemoteMessagePayload.fromMessage(RemoteMessage message) {
    return RemoteMessagePayload(
      message.data,
      notificationTitle: message.notification?.title,
      notificationBody: message.notification?.body,
    );
  }

  String get title {
    final fromNotification = notificationTitle?.trim();
    if (fromNotification != null && fromNotification.isNotEmpty) {
      return fromNotification;
    }
    final fromData = data['title']?.toString().trim();
    if (fromData != null && fromData.isNotEmpty) {
      return fromData;
    }
    return 'Conecta Geração';
  }

  String get body {
    final fromNotification = notificationBody?.trim();
    if (fromNotification != null && fromNotification.isNotEmpty) {
      return fromNotification;
    }
    final fromData = data['body']?.toString().trim();
    if (fromData != null && fromData.isNotEmpty) {
      return fromData;
    }
    return 'Você tem uma nova mensagem.';
  }
}
