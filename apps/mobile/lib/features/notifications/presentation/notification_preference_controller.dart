import 'dart:async';

import 'package:conecta_geracao/core/network/api_exception.dart';
import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/features/notifications/presentation/notification_permission_controller.dart';
import 'package:conecta_geracao/features/notifications/presentation/notifications_providers.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class NotificationPreferenceController extends AsyncNotifier<bool> {
  Completer<bool>? _permissionCompleter;

  @override
  Future<bool> build() async {
    ref.onDispose(() => _completePermissionRequest(false));

    final isAuthenticated = ref.watch(authGateProvider).isAuthenticated;
    final isGuest = ref.watch(guestSessionGateProvider).isGuestActive;

    if (!isAuthenticated || isGuest) {
      return false;
    }

    final response = await ref.read(notificationsApiProvider).getPreference();
    return response.enabled;
  }

  Future<void> setEnabled(bool enabled) async {
    final previous = state.value ?? false;
    state = AsyncValue<bool>.loading().copyWithPrevious(state);

    try {
      if (enabled) {
        final granted = await _ensureOsPermission();
        if (!granted) {
          state = AsyncValue.data(previous);
          return;
        }
      }

      await ref
          .read(notificationsApiProvider)
          .updatePreference(enabled: enabled);

      if (enabled) {
        await ref.read(notificationsRepositoryProvider).syncTokenIfPermitted();
      }

      state = AsyncValue.data(enabled);
    } on ApiException {
      state = AsyncValue.data(previous);
      rethrow;
    } catch (_) {
      state = AsyncValue.data(previous);
      rethrow;
    }
  }

  Future<bool> _ensureOsPermission() async {
    final pushClient = ref.read(pushMessagingClientProvider);
    final settings = await pushClient.getNotificationSettings();
    if (settings.isAuthorized) {
      return true;
    }

    _permissionCompleter = Completer<bool>();
    ref
        .read(notificationPermissionControllerProvider.notifier)
        .offerPermissionFromSettings(_completePermissionRequest);

    return _permissionCompleter!.future;
  }

  void _completePermissionRequest(bool granted) {
    final completer = _permissionCompleter;
    _permissionCompleter = null;
    if (completer != null && !completer.isCompleted) {
      completer.complete(granted);
    }
  }
}

final notificationPreferenceControllerProvider =
    AsyncNotifierProvider<NotificationPreferenceController, bool>(
      NotificationPreferenceController.new,
    );
