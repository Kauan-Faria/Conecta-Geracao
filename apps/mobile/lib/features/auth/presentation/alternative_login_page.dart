import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:conecta_geracao/core/widgets/app_scaffold.dart';
import 'package:conecta_geracao/features/auth/data/auth_repository.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class AlternativeLoginPage extends ConsumerStatefulWidget {
  const AlternativeLoginPage({super.key});

  @override
  ConsumerState<AlternativeLoginPage> createState() =>
      _AlternativeLoginPageState();
}

class _AlternativeLoginPageState extends ConsumerState<AlternativeLoginPage> {
  String? _errorMessage;

  Future<void> _handleGoogleSignIn() async {
    setState(() => _errorMessage = null);
    await ref.read(authControllerProvider.notifier).signInWithGoogle();
    final error = ref.read(authControllerProvider).error;
    if (error is AuthException && !error.isCancelled) {
      setState(() => _errorMessage = error.message);
      return;
    }
    if (mounted && ref.read(authControllerProvider).error == null) {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final theme = Theme.of(context);

    return AppScaffold(
      title: 'Entrar de outra forma',
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Se preferir, use sua conta Google.',
            style: theme.textTheme.bodyLarge,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.xl),
          if (_errorMessage != null) ...[
            Semantics(
              liveRegion: true,
              child: Text(
                _errorMessage!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.error,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            SizedBox(height: AppSpacing.md),
          ],
          AppButton(
            label: 'Entrar com Google',
            semanticLabel: 'Entrar com Google',
            isLoading: authState.isLoading,
            onPressed: authState.isLoading ? null : _handleGoogleSignIn,
          ),
          SizedBox(height: AppSpacing.lg),
          TextButton(
            onPressed: authState.isLoading ? null : () => context.pop(),
            child: const Text('Voltar para celular'),
          ),
        ],
      ),
    );
  }
}
