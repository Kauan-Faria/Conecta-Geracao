import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/features/auth/data/auth_repository.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/email_auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/guest_session_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_cta_button.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_screen_scaffold.dart';
import 'package:conecta_geracao/features/chat/presentation/chat_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class EmailAuthPage extends ConsumerStatefulWidget {
  const EmailAuthPage({this.initialMode = EmailAuthMode.signUp, super.key});

  final EmailAuthMode initialMode;

  @override
  ConsumerState<EmailAuthPage> createState() => _EmailAuthPageState();
}

class _EmailAuthPageState extends ConsumerState<EmailAuthPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(emailAuthControllerProvider.notifier)
          .setMode(widget.initialMode);
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleAdvance() async {
    final emailState = ref.read(emailAuthControllerProvider);
    final ok = await ref
        .read(emailAuthControllerProvider.notifier)
        .submit(
          email: _emailController.text,
          password: _passwordController.text,
          confirmPassword: emailState.mode == EmailAuthMode.signUp
              ? _confirmPasswordController.text
              : null,
        );
    if (!ok || !mounted) {
      return;
    }

    final user = ref.read(authGateProvider).user;
    if (user != null && !user.emailVerified) {
      context.go('/login/email-verify');
      return;
    }
    context.go('/home');
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

  Future<void> _handleForgotPassword() async {
    await ref
        .read(emailAuthControllerProvider.notifier)
        .sendPasswordReset(_emailController.text);
  }

  Future<void> _enterAsGuest() async {
    ref.invalidate(chatControllerProvider);
    await ref.read(guestSessionGateProvider).enterAsGuest();
    if (mounted) {
      context.go('/home');
    }
  }

  void _goToSignUp() {
    ref.read(emailAuthControllerProvider.notifier).setMode(EmailAuthMode.signUp);
    context.go('/login/email');
  }

  @override
  Widget build(BuildContext context) {
    final emailState = ref.watch(emailAuthControllerProvider);
    final authState = ref.watch(authControllerProvider);
    final theme = Theme.of(context);
    final isSignUp = emailState.mode == EmailAuthMode.signUp;
    final isBusy = emailState.isLoading || authState.isLoading;

    return AuthScreenScaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            isSignUp ? 'Vamos fazer seu cadastro' : 'Entrar com email e senha',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.sm),
          Text(
            isSignUp
                ? 'Faça seu cadastro com email e senha, ou entre com sua conta google'
                : 'Selecione seu email e senha para entrar',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.xl),
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            autofillHints: const [AutofillHints.email],
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: 'Digite seu Email:',
              border: OutlineInputBorder(),
            ),
          ),
          SizedBox(height: AppSpacing.md),
          TextField(
            controller: _passwordController,
            obscureText: _obscurePassword,
            autofillHints: isSignUp
                ? const [AutofillHints.newPassword]
                : const [AutofillHints.password],
            textInputAction: isSignUp
                ? TextInputAction.next
                : TextInputAction.done,
            decoration: InputDecoration(
              labelText: 'Digite sua senha:',
              border: const OutlineInputBorder(),
              suffixIcon: Semantics(
                button: true,
                label: _obscurePassword ? 'Mostrar senha' : 'Ocultar senha',
                child: IconButton(
                  icon: Icon(
                    _obscurePassword ? Icons.visibility : Icons.visibility_off,
                  ),
                  onPressed: () =>
                      setState(() => _obscurePassword = !_obscurePassword),
                ),
              ),
            ),
          ),
          if (isSignUp) ...[
            SizedBox(height: AppSpacing.md),
            TextField(
              controller: _confirmPasswordController,
              obscureText: _obscureConfirmPassword,
              autofillHints: const [AutofillHints.newPassword],
              textInputAction: TextInputAction.done,
              decoration: InputDecoration(
                labelText: 'Confirme sua senha:',
                border: const OutlineInputBorder(),
                suffixIcon: Semantics(
                  button: true,
                  label: _obscureConfirmPassword
                      ? 'Mostrar senha'
                      : 'Ocultar senha',
                  child: IconButton(
                    icon: Icon(
                      _obscureConfirmPassword
                          ? Icons.visibility
                          : Icons.visibility_off,
                    ),
                    onPressed: () => setState(
                      () => _obscureConfirmPassword = !_obscureConfirmPassword,
                    ),
                  ),
                ),
              ),
            ),
          ],
          if (!isSignUp) ...[
            SizedBox(height: AppSpacing.sm),
            Align(
              alignment: Alignment.centerRight,
              child: Semantics(
                button: true,
                label: 'Esqueceu a senha',
                child: TextButton(
                  onPressed: isBusy ? null : _handleForgotPassword,
                  child: const Text('Esqueceu a senha ?'),
                ),
              ),
            ),
          ],
          if (emailState.resetEmailSent &&
              emailState.resetEmailAddress != null) ...[
            SizedBox(height: AppSpacing.md),
            Semantics(
              liveRegion: true,
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Enviamos um e-mail para ${emailState.resetEmailAddress}. '
                  'Siga o link para criar uma nova senha.',
                  style: theme.textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ],
          if (emailState.shouldShowForgotPasswordBanner &&
              !emailState.resetEmailSent) ...[
            SizedBox(height: AppSpacing.md),
            Semantics(
              liveRegion: true,
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.primary),
                ),
                child: Text(
                  'Parece que você esqueceu a senha. Podemos te ajudar.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ],
          if (emailState.errorMessage != null) ...[
            SizedBox(height: AppSpacing.md),
            Semantics(
              liveRegion: true,
              child: Text(
                emailState.errorMessage!,
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
              semanticLabel: isSignUp
                  ? 'Continuar e criar conta com e-mail'
                  : 'Continuar e entrar com e-mail',
              isLoading: emailState.isLoading,
              onPressed: isBusy ? null : _handleAdvance,
            ),
            SizedBox(height: AppSpacing.md),
            if (!isSignUp)
              AuthCtaButton(
                label: 'Não possuo Cadastro',
                semanticLabel: 'Não possuo cadastro, criar conta com e-mail',
                variant: AuthCtaVariant.secondary,
                onPressed: isBusy ? null : _goToSignUp,
              ),
            if (!isSignUp) SizedBox(height: AppSpacing.md),
            AuthCtaButton(
              label: 'Se cadastrar com o Google',
              semanticLabel: 'Se cadastrar com o Google',
              variant: AuthCtaVariant.secondary,
              isLoading: authState.isLoading,
              onPressed: isBusy ? null : _handleGoogleSignIn,
            ),
            if (isSignUp) ...[
              SizedBox(height: AppSpacing.md),
              AuthCtaButton(
                label: 'Entrar sem Cadastro',
                semanticLabel: 'Entrar sem cadastro, como convidado',
                variant: AuthCtaVariant.secondary,
                onPressed: isBusy ? null : _enterAsGuest,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
