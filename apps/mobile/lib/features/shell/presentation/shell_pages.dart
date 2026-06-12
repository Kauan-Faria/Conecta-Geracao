import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/widgets/app_scaffold.dart';
import 'package:conecta_geracao/features/accessibility/presentation/settings_accessibility_section.dart';
import 'package:conecta_geracao/features/auth/data/auth_repository.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_cta_button.dart';
import 'package:conecta_geracao/features/notifications/presentation/settings_notifications_section.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class SettingsPage extends ConsumerStatefulWidget {
  const SettingsPage({super.key});

  @override
  ConsumerState<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends ConsumerState<SettingsPage> {
  Future<void> _handleGoogleSignIn() async {
    await ref.read(authControllerProvider.notifier).signInWithGoogle();
    if (!mounted) {
      return;
    }
    final error = ref.read(authControllerProvider).error;
    if (error is AuthException && !error.isCancelled) {
      return;
    }
    if (ref.read(authControllerProvider).error == null) {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAuthenticated = ref.watch(authGateProvider).isAuthenticated;
    final authState = ref.watch(authControllerProvider);
    final isBusy = authState.isLoading;
    final theme = Theme.of(context);

    return AppScaffold(
      title: 'Configurações',
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SettingsAccessibilitySection(),
            const SettingsNotificationsSection(),
            SizedBox(height: AppSpacing.lg),
            if (isAuthenticated)
              AuthCtaButton(
                label: 'Sair da sua conta',
                semanticLabel: 'Sair da sua conta',
                icon: AuthCtaIcon.back,
                isLoading: isBusy,
                onPressed: isBusy
                    ? null
                    : () =>
                          ref.read(authControllerProvider.notifier).signOut(),
              )
            else ...[
              Text(
                'Você ainda não fez seu cadastro, sendo assim não '
                'consiguiremos salvar suas conversas dentro do app, '
                'futuramente não sera possível fazer consulta em conversas '
                'antigas.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              SizedBox(height: AppSpacing.lg),
              AuthCtaButton(
                label: 'Fazer cadastro com número de telefone',
                semanticLabel: 'Fazer cadastro com número de telefone',
                variant: AuthCtaVariant.secondary,
                onPressed: isBusy ? null : () => context.push('/login/phone'),
              ),
              SizedBox(height: AppSpacing.md),
              AuthCtaButton(
                label: 'Se cadastrar com Email e senha',
                semanticLabel: 'Se cadastrar com e-mail e senha',
                variant: AuthCtaVariant.accent,
                onPressed: isBusy ? null : () => context.push('/login/email'),
              ),
              SizedBox(height: AppSpacing.md),
              AuthCtaButton(
                label: 'Se você possui conta no google entre com ela',
                semanticLabel: 'Entrar com a sua conta do Google',
                variant: AuthCtaVariant.indigo,
                isLoading: isBusy,
                onPressed: isBusy ? null : _handleGoogleSignIn,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
