import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/features/auth/presentation/email_verification_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_cta_button.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_screen_scaffold.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class EmailVerificationPage extends ConsumerWidget {
  const EmailVerificationPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final verifyState = ref.watch(emailVerificationControllerProvider);
    final theme = Theme.of(context);
    final canResend = verifyState.resendCooldownSeconds <= 0;
    final isBusy = verifyState.isLoading || verifyState.isResending;

    Future<void> handleAdvance() async {
      final verified = await ref
          .read(emailVerificationControllerProvider.notifier)
          .checkVerification();
      if (verified && context.mounted) {
        context.go('/home');
      }
    }

    Future<void> handleResend() async {
      await ref
          .read(emailVerificationControllerProvider.notifier)
          .resendVerificationEmail();
    }

    return AuthScreenScaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Vamos finalizar seu cadastro',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.sm),
          Text(
            'Enviamos um e-mail com um link de confirmação. '
            'Abra o link no seu e-mail e depois toque em Avançar. '
            'Se não encontrar, verifique a caixa de spam.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.xl),
          Semantics(
            label: 'Ilustração de e-mail de confirmação',
            child: Icon(
              Icons.mark_email_unread_outlined,
              size: 96,
              color: AppColors.primary.withValues(alpha: 0.8),
            ),
          ),
          if (verifyState.infoMessage != null) ...[
            SizedBox(height: AppSpacing.md),
            Semantics(
              liveRegion: true,
              child: Text(
                verifyState.infoMessage!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColors.primaryDark,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
          if (verifyState.errorMessage != null) ...[
            SizedBox(height: AppSpacing.md),
            Semantics(
              liveRegion: true,
              child: Text(
                verifyState.errorMessage!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.error,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ],
      ),
      bottom: Padding(
        padding: const EdgeInsets.only(
          top: AppSpacing.md,
          bottom: AppSpacing.lg,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AuthCtaButton(
              label: 'Avançar',
              semanticLabel: 'Avançar após confirmar e-mail',
              isLoading: verifyState.isLoading,
              onPressed: isBusy ? null : handleAdvance,
            ),
            SizedBox(height: AppSpacing.md),
            AuthCtaButton(
              label: canResend
                  ? 'Reenviar e-mail'
                  : 'Reenviar e-mail (${verifyState.resendCooldownSeconds}s)',
              semanticLabel: 'Reenviar e-mail de confirmação',
              variant: AuthCtaVariant.secondary,
              isLoading: verifyState.isResending,
              onPressed: isBusy || !canResend ? null : handleResend,
            ),
            SizedBox(height: AppSpacing.md),
            AuthCtaButton(
              label: 'Voltar e editar Email',
              semanticLabel: 'Voltar e editar e-mail de cadastro',
              icon: AuthCtaIcon.back,
              variant: AuthCtaVariant.secondary,
              onPressed: isBusy
                  ? null
                  : () => context.go('/login/email?mode=signup'),
            ),
          ],
        ),
      ),
    );
  }
}
