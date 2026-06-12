import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/features/auth/data/auth_repository.dart';
import 'package:conecta_geracao/features/auth/data/firebase_auth_repository.dart';
import 'package:conecta_geracao/features/auth/domain/phone_country.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/guest_session_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/phone_auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_cta_button.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_screen_scaffold.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/international_phone_field.dart';
import 'package:conecta_geracao/features/chat/presentation/chat_controller.dart';
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
  PhoneCountry _selectedCountry = PhoneCountry.defaultCountry;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _handleCountryChanged(PhoneCountry country) {
    setState(() {
      _selectedCountry = country;
      _phoneController.clear();
    });
    ref.read(phoneAuthControllerProvider.notifier).clearError();
  }

  Future<void> _handleAdvance() async {
    final sent = await ref
        .read(phoneAuthControllerProvider.notifier)
        .sendCode(_phoneController.text, country: _selectedCountry);
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

  Future<void> _enterAsGuest() async {
    ref.invalidate(chatControllerProvider);
    await ref.read(guestSessionGateProvider).enterAsGuest();
    if (mounted) {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final phoneState = ref.watch(phoneAuthControllerProvider);
    final authState = ref.watch(authControllerProvider);
    final theme = Theme.of(context);
    final isComplete = _selectedCountry.isComplete(_phoneController.text);
    final isBusy = phoneState.isSendingCode || authState.isLoading;

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
          InternationalPhoneField(
            controller: _phoneController,
            selectedCountry: _selectedCountry,
            onCountryChanged: _handleCountryChanged,
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
              label: 'Continuar',
              semanticLabel: 'Continuar e receber código por SMS',
              isLoading: phoneState.isSendingCode,
              onPressed: isComplete && !phoneState.isSendingCode
                  ? _handleAdvance
                  : null,
            ),
            SizedBox(height: AppSpacing.md),
            AuthCtaButton(
              label: 'Entra com Email e senha',
              semanticLabel: 'Entrar com e-mail e senha',
              variant: AuthCtaVariant.accent,
              onPressed: isBusy
                  ? null
                  : () => context.push('/login/email?mode=signin'),
            ),
            SizedBox(height: AppSpacing.md),
            AuthCtaButton(
              label: 'Se cadastrar com o Google',
              semanticLabel: 'Se cadastrar com o Google',
              variant: AuthCtaVariant.secondary,
              isLoading: authState.isLoading,
              onPressed: isBusy ? null : _handleGoogleSignIn,
            ),
            SizedBox(height: AppSpacing.md),
            AuthCtaButton(
              label: 'Entrar sem Cadastro',
              semanticLabel: 'Entrar sem cadastro, como convidado',
              variant: AuthCtaVariant.indigo,
              onPressed: isBusy ? null : _enterAsGuest,
            ),
          ],
        ),
      ),
    );
  }
}
