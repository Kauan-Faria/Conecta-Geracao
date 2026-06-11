import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:conecta_geracao/core/widgets/app_scaffold.dart';
import 'package:conecta_geracao/features/accessibility/presentation/settings_accessibility_section.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/notifications/presentation/settings_notifications_section.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class SettingsPage extends ConsumerWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAuthenticated = ref.watch(authGateProvider).isAuthenticated;
    final isGuest = ref.watch(guestSessionGateProvider).isGuestActive;

    return AppScaffold(
      title: 'Configurações',
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SettingsAccessibilitySection(),
          const SettingsNotificationsSection(),
          if (isGuest && !isAuthenticated) ...[
            SizedBox(height: AppSpacing.lg),
            Text(
              'Você está usando o app sem cadastro. '
              'Suas conversas desta visita não ficam salvas para a próxima vez.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            SizedBox(height: AppSpacing.md),
            AppButton(
              label: 'Entrar com celular',
              semanticLabel: 'Entrar com celular para salvar suas conversas',
              onPressed: () => context.push('/login'),
            ),
          ],
          const Spacer(),
          if (isAuthenticated)
            AppButton(
              label: 'Sair',
              semanticLabel: 'Sair da conta',
              onPressed: () {
                ref.read(authControllerProvider.notifier).signOut();
              },
            ),
        ],
      ),
    );
  }
}
