import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:conecta_geracao/core/widgets/app_scaffold.dart';
import 'package:conecta_geracao/features/auth/data/firebase_auth_repository.dart';
import 'package:conecta_geracao/features/auth/domain/brazil_phone_formatter.dart';
import 'package:conecta_geracao/features/auth/presentation/phone_auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _phoneController = TextEditingController();

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _handleReceiveCode() async {
    final sent = await ref
        .read(phoneAuthControllerProvider.notifier)
        .sendCode(_phoneController.text);
    if (!mounted) {
      return;
    }

    final phoneState = ref.read(phoneAuthControllerProvider);
    if (phoneState.session?.verificationId == autoVerifiedPhoneVerificationId) {
      context.go('/home');
      return;
    }

    if (sent) {
      context.push('/login/otp', extra: _phoneController.text);
    }
  }

  @override
  Widget build(BuildContext context) {
    final phoneState = ref.watch(phoneAuthControllerProvider);
    final theme = Theme.of(context);
    final isComplete = BrazilPhoneFormatter.isComplete(_phoneController.text);

    return AppScaffold(
      title: 'Entrar',
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Seu celular',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.sm),
          Text(
            'Informe seu número com DDD. Vamos enviar um código por mensagem de texto.',
            style: theme.textTheme.bodyLarge,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.xl),
          Semantics(
            label: 'Número de celular com DDD',
            textField: true,
            child: TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(11),
                _BrazilPhoneInputFormatter(),
              ],
              decoration: const InputDecoration(
                labelText: 'Celular',
                hintText: '(11) 99999-9999',
                prefixText: '+55 ',
              ),
              onChanged: (_) => setState(() {}),
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
            label: 'Receber código',
            semanticLabel: 'Receber código por mensagem de texto',
            isLoading: phoneState.isSendingCode,
            onPressed: isComplete && !phoneState.isSendingCode
                ? _handleReceiveCode
                : null,
          ),
          SizedBox(height: AppSpacing.md),
          AppButton(
            label: 'Entrar de outra forma',
            semanticLabel: 'Entrar de outra forma, por exemplo com Google',
            onPressed: phoneState.isSendingCode
                ? null
                : () => context.push('/login/alternative'),
          ),
        ],
      ),
    );
  }
}

class _BrazilPhoneInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final formatted = BrazilPhoneFormatter.formatDisplay(newValue.text);
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
