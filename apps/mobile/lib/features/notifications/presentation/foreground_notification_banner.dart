import 'package:conecta_geracao/features/notifications/presentation/notification_navigation_coordinator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ForegroundNotificationBannerHost extends ConsumerStatefulWidget {
  const ForegroundNotificationBannerHost({required this.child, super.key});

  final Widget child;

  @override
  ConsumerState<ForegroundNotificationBannerHost> createState() =>
      _ForegroundNotificationBannerHostState();
}

class _ForegroundNotificationBannerHostState
    extends ConsumerState<ForegroundNotificationBannerHost> {
  MaterialBanner? _banner;

  @override
  Widget build(BuildContext context) {
    ref
        .read(notificationNavigationCoordinatorProvider)
        .attachMessengerContext(context);

    ref.listen<ForegroundNotificationState>(
      foregroundNotificationControllerProvider,
      (previous, next) {
        final active = next.active;
        if (active == null) {
          _hideBanner();
          return;
        }

        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!mounted) {
            return;
          }
          _showBanner(active);
        });
      },
    );

    return widget.child;
  }

  void _showBanner(ForegroundNotificationData data) {
    _hideBanner();

    final messenger = ScaffoldMessenger.of(context);
    _banner = MaterialBanner(
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            data.title,
            style: Theme.of(context).textTheme.titleSmall,
          ),
          Text(data.body),
        ],
      ),
      leading: const Icon(Icons.notifications_outlined),
      actions: [
        TextButton(
          onPressed: () {
            ref
                .read(foregroundNotificationControllerProvider.notifier)
                .dismiss();
          },
          child: const Text('Fechar'),
        ),
        TextButton(
          onPressed: () {
            ref
                .read(notificationNavigationCoordinatorProvider)
                .openFromBanner(data.payload);
          },
          child: const Text('Ver'),
        ),
      ],
    );

    messenger.showMaterialBanner(_banner!);
  }

  void _hideBanner() {
    if (_banner == null) {
      return;
    }
    ScaffoldMessenger.of(context).hideCurrentMaterialBanner();
    _banner = null;
  }

  @override
  void dispose() {
    _hideBanner();
    super.dispose();
  }
}
