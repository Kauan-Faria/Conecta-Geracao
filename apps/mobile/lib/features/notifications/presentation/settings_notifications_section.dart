import 'package:conecta_geracao/core/network/api_exception.dart';
import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/features/notifications/presentation/notification_preference_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SettingsNotificationsSection extends ConsumerWidget {
  const SettingsNotificationsSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAuthenticated = ref.watch(authGateProvider).isAuthenticated;
    final isGuest = ref.watch(guestSessionGateProvider).isGuestActive;

    if (!isAuthenticated || isGuest) {
      return const SizedBox.shrink();
    }

    final preference = ref.watch(notificationPreferenceControllerProvider);
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: AppSpacing.lg),
        Text('Notificações', style: theme.textTheme.titleLarge),
        SizedBox(height: AppSpacing.md),
        preference.when(
          loading: () => const LinearProgressIndicator(),
          error: (error, _) => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Não foi possível carregar suas preferências.',
                style: theme.textTheme.bodyMedium,
              ),
              SizedBox(height: AppSpacing.sm),
              TextButton(
                onPressed: () {
                  ref.invalidate(notificationPreferenceControllerProvider);
                },
                child: const Text('Tentar novamente'),
              ),
            ],
          ),
          data: (enabled) => Semantics(
            label: 'Receber notificações',
            toggled: enabled,
            child: SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Receber notificações'),
              subtitle: const Text(
                'Avisos sobre conversas e dicas úteis no celular',
              ),
              value: enabled,
              onChanged: (value) async {
                try {
                  await ref
                      .read(notificationPreferenceControllerProvider.notifier)
                      .setEnabled(value);
                } on ApiException {
                  if (!context.mounted) {
                    return;
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                        'Não foi possível salvar. Tente de novo em instantes.',
                      ),
                    ),
                  );
                }
              },
            ),
          ),
        ),
      ],
    );
  }
}
