import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/features/auth/data/firebase_auth_repository.dart';
import 'package:conecta_geracao/features/auth/presentation/phone_auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_cta_button.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_screen_scaffold.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/otp_pin_input.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class PhoneOtpPage extends ConsumerStatefulWidget {
  const PhoneOtpPage({required this.phoneDigits, super.key});

  final String phoneDigits;

  @override
  ConsumerState<PhoneOtpPage> createState() => _PhoneOtpPageState();
}

class _PhoneOtpPageState extends ConsumerState<PhoneOtpPage> {
  final _otpController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final session = ref.read(phoneAuthControllerProvider).session;
      if (session?.verificationId == autoVerifiedPhoneVerificationId) {
        if (mounted) {
          context.go('/home');
        }
      }
    });
  }

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _confirmCode() async {
    final ok = await ref
        .read(phoneAuthControllerProvider.notifier)
        .confirmOtp(_otpController.text);
    if (ok && mounted) {
      context.go('/home');
    }
  }

  Future<void> _resendCode() async {
    await ref
        .read(phoneAuthControllerProvider.notifier)
        .resendCode(widget.phoneDigits);
  }

  @override
  Widget build(BuildContext context) {
    final phoneState = ref.watch(phoneAuthControllerProvider);
    final theme = Theme.of(context);
    final canResend = phoneState.resendCooldownSeconds <= 0;
    final otpDigits = _otpController.text.replaceAll(RegExp(r'\D'), '');
    final isOtpComplete = otpDigits.length == 6;

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
            'Você receberá um SMS com o Token, copie ou memorize ele e '
            'coloque no campo abaixo',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.xl),
          OtpPinInput(
            controller: _otpController,
            onChanged: (_) => setState(() {}),
          ),
          if (phoneState.errorMessage != null) ...[
            SizedBox(height: AppSpacing.md),
            Semantics(
              liveRegion: true,
              child: Text(
                phoneState.errorMessage!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.error,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
          SizedBox(height: AppSpacing.md),
          Center(
            child: TextButton(
              onPressed: canResend && !phoneState.isSendingCode
                  ? _resendCode
                  : null,
              child: Text(
                canResend
                    ? 'Não recebi o código'
                    : 'Aguarde ${phoneState.resendCooldownSeconds} segundos',
              ),
            ),
          ),
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
              semanticLabel: 'Avançar e confirmar código recebido por SMS',
              isLoading: phoneState.isVerifying,
              onPressed: isOtpComplete && !phoneState.isVerifying
                  ? _confirmCode
                  : null,
            ),
            SizedBox(height: AppSpacing.md),
            AuthCtaButton(
              label: 'Voltar e editar telefone',
              semanticLabel: 'Voltar e editar número de telefone',
              variant: AuthCtaVariant.secondary,
              icon: AuthCtaIcon.back,
              onPressed: phoneState.isVerifying ? null : () => context.pop(),
            ),
          ],
        ),
      ),
    );
  }
}
