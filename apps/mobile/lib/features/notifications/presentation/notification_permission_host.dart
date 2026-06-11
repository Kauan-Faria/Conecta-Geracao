import 'package:conecta_geracao/features/notifications/presentation/notification_permission_controller.dart';
import 'package:conecta_geracao/features/notifications/presentation/notification_permission_dialog.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class NotificationPermissionHost extends ConsumerStatefulWidget {
  const NotificationPermissionHost({required this.child, super.key});

  final Widget child;

  @override
  ConsumerState<NotificationPermissionHost> createState() =>
      _NotificationPermissionHostState();
}

class _NotificationPermissionHostState
    extends ConsumerState<NotificationPermissionHost> {
  @override
  Widget build(BuildContext context) {
    ref.listen<NotificationPermissionState>(
      notificationPermissionControllerProvider,
      (previous, next) {
        if (next.showPrompt && previous?.showPrompt != true) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (!mounted) {
              return;
            }
            showNotificationPermissionDialog(
              context: context,
              onAccept: () {
                ref
                    .read(notificationPermissionControllerProvider.notifier)
                    .acceptPrompt();
              },
              onDecline: () {
                ref
                    .read(notificationPermissionControllerProvider.notifier)
                    .declinePrompt();
              },
            );
          });
        }
      },
    );

    return widget.child;
  }
}
