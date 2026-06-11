import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/features/auth/data/auth_repository.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/email_auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_cta_button.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_screen_scaffold.dart';
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
      ref.read(emailAuthControllerProvider.notifier).setMode(widget.initialMode);
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
            isSignUp ? 'Vamos fazer seu cadastro' : 'Entrar com e-mail',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: AppSpacing.sm),
          Text(
            isSignUp
                ? 'Preencha com seu e-mail e crie uma senha para continuar'
                : 'Digite seu e-mail e senha para entrar',
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
              labelText: 'E-mail',
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
            textInputAction: isSignUp ? TextInputAction.next : TextInputAction.done,
            decoration: InputDecoration(
              labelText: 'Senha',
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
                labelText: 'Confirmar senha',
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
          if (!isSignUp) ...[
            SizedBox(height: AppSpacing.md),
            Align(
              alignment: Alignment.center,
              child: Semantics(
                button: true,
                label: 'Esqueci minha senha',
                child: TextButton(
                  onPressed: isBusy ? null : _handleForgotPassword,
                  child: const Text('Esqueci minha senha'),
                ),
              ),
            ),
          ],
          SizedBox(height: AppSpacing.sm),
          Align(
            alignment: Alignment.center,
            child: TextButton(
              onPressed: isBusy
                  ? null
                  : () =>
                        ref.read(emailAuthControllerProvider.notifier).toggleMode(),
              child: Text(
                isSignUp ? 'Já tenho conta' : 'Criar conta',
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
              semanticLabel: isSignUp
                  ? 'Avançar e criar conta com e-mail'
                  : 'Avançar e entrar com e-mail',
              isLoading: emailState.isLoading,
              onPressed: isBusy ? null : _handleAdvance,
            ),
            SizedBox(height: AppSpacing.md),
            AuthCtaButton(
              label: isSignUp
                  ? 'Se cadastrar com o Google'
                  : 'Entrar com o Google',
              semanticLabel: isSignUp
                  ? 'Se cadastrar com o Google'
                  : 'Entrar com o Google',
              variant: AuthCtaVariant.secondary,
              isLoading: authState.isLoading,
              onPressed: isBusy ? null : _handleGoogleSignIn,
            ),
            SizedBox(height: AppSpacing.md),
            AuthCtaButton(
              label: 'Voltar',
              semanticLabel: 'Voltar para cadastro por telefone',
              icon: AuthCtaIcon.back,
              variant: AuthCtaVariant.secondary,
              onPressed: isBusy ? null : () => context.pop(),
            ),
          ],
        ),
      ),
    );
  }
}
