import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:conecta_geracao/core/widgets/app_scaffold.dart';
import 'package:conecta_geracao/features/auth/data/firebase_auth_repository.dart';
import 'package:conecta_geracao/features/auth/presentation/phone_auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

    return AppScaffold(
      title: 'Código no seu celular',
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Enviamos um código de 6 números por mensagem de texto para o celular que você informou.',
            style: theme.textTheme.bodyLarge,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.sm),
          Text(
            'Quando a mensagem chegar, digite o código aqui. Se aparecer uma sugestão em cima do teclado, toque nela para preencher sozinho.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.xl),
          Semantics(
            label: 'Código de 6 números recebido por SMS',
            textField: true,
            child: TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              autofillHints: const [AutofillHints.oneTimeCode],
              textAlign: TextAlign.center,
              style: theme.textTheme.headlineSmall,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(6),
              ],
              decoration: const InputDecoration(
                labelText: 'Código',
                hintText: '000000',
              ),
              onSubmitted: (_) => _confirmCode(),
            ),
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
          SizedBox(height: AppSpacing.lg),
          AppButton(
            label: 'Confirmar código',
            semanticLabel: 'Confirmar código recebido por SMS',
            isLoading: phoneState.isVerifying,
            onPressed: phoneState.isVerifying ? null : _confirmCode,
          ),
          SizedBox(height: AppSpacing.md),
          AppButton(
            label: canResend
                ? 'Não recebi o código'
                : 'Aguarde ${phoneState.resendCooldownSeconds} segundos',
            semanticLabel: canResend
                ? 'Reenviar código por mensagem de texto'
                : 'Aguardar para reenviar código',
            onPressed: canResend && !phoneState.isSendingCode
                ? _resendCode
                : null,
          ),
          SizedBox(height: AppSpacing.sm),
          TextButton(
            onPressed: () => context.push('/login/alternative'),
            child: const Text('Entrar de outra forma'),
          ),
        ],
      ),
    );
  }
}
