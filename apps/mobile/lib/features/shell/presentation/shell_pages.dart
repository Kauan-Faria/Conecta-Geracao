import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:conecta_geracao/core/widgets/app_scaffold.dart';
import 'package:conecta_geracao/features/accessibility/presentation/settings_accessibility_section.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return AppScaffold(
      title: 'Início',
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bem-vindo ao Conecta Geração',
            style: theme.textTheme.headlineMedium,
          ),
          SizedBox(height: AppSpacing.md),
          Text(
            'Use o menu abaixo para falar com o assistente ou ajustar suas preferências.',
            style: theme.textTheme.bodyLarge,
          ),
        ],
      ),
    );
  }
}

class ChatPlaceholderPage extends StatelessWidget {
  const ChatPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppScaffold(
      title: 'Chat',
      body: Center(
        child: Text(
          'Assistente em breve',
          style: theme.textTheme.titleLarge,
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}

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
          if (isGuest && !isAuthenticated) ...[
            SizedBox(height: AppSpacing.lg),
            Text(
              'Você está usando o app sem cadastro. '
              'Seu histórico fica salvo por alguns dias neste aparelho.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            SizedBox(height: AppSpacing.md),
            AppButton(
              label: 'Entrar com Google',
              semanticLabel: 'Entrar com Google para salvar suas conversas',
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
