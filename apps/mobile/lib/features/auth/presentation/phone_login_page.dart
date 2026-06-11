import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/features/auth/data/firebase_auth_repository.dart';
import 'package:conecta_geracao/features/auth/domain/brazil_phone_formatter.dart';
import 'package:conecta_geracao/features/auth/presentation/phone_auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_cta_button.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_screen_scaffold.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/brazil_phone_field.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class PhoneLoginPage extends ConsumerStatefulWidget {
  const PhoneLoginPage({super.key});

  @override
  ConsumerState<PhoneLoginPage> createState() => _PhoneLoginPageState();
}

class _PhoneLoginPageState extends ConsumerState<PhoneLoginPage> {
  final _phoneController = TextEditingController();

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _handleAdvance() async {
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

    return AuthScreenScaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Vamos fazer seu cadastro',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.sm),
          Text(
            'Para se cadastrar preencha com seu número de telefone no campo abaixo',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.xl),
          BrazilPhoneField(
            controller: _phoneController,
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
              semanticLabel: 'Avançar e receber código por SMS',
              isLoading: phoneState.isSendingCode,
              onPressed: isComplete && !phoneState.isSendingCode
                  ? _handleAdvance
                  : null,
            ),
            SizedBox(height: AppSpacing.md),
            AuthCtaButton(
              label: 'Se cadastrar de outra forma',
              semanticLabel:
                  'Se cadastrar de outra forma, por exemplo com e-mail',
              variant: AuthCtaVariant.secondary,
              onPressed: phoneState.isSendingCode
                  ? null
                  : () => context.push('/login/email'),
            ),
          ],
        ),
      ),
    );
  }
}
