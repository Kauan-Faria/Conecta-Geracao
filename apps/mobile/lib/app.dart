import 'package:conecta_geracao/core/routing/app_router.dart';
import 'package:conecta_geracao/core/theme/app_theme.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/notifications/presentation/foreground_notification_banner.dart';
import 'package:conecta_geracao/features/notifications/presentation/notification_permission_host.dart';
import 'package:conecta_geracao/features/notifications/presentation/notifications_bootstrap.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ConectaGeracaoApp extends ConsumerWidget {
  const ConectaGeracaoApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.watch(notificationsBootstrapProvider);
    final router = ref.watch(routerProvider);
    final accessibilityPrefs = ref.watch(accessibilityControllerProvider);

    return MaterialApp.router(
      title: 'Conecta Geração',
      theme: buildAppTheme(accessibilityPrefs),
      routerConfig: router,
      builder: (context, child) {
        final mediaQuery = MediaQuery.of(context);
        return ForegroundNotificationBannerHost(
          child: NotificationPermissionHost(
            child: MediaQuery(
              data: mediaQuery.copyWith(
                textScaler: TextScaler.linear(
                  accessibilityPrefs.fontScale.multiplier,
                ),
              ),
              child: child ?? const SizedBox.shrink(),
            ),
          ),
        );
      },
    );
  }
}
