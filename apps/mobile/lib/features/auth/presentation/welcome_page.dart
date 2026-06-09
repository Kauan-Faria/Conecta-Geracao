import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:conecta_geracao/features/auth/presentation/guest_session_controller.dart';
import 'package:conecta_geracao/features/chat/presentation/chat_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class WelcomePage extends ConsumerWidget {
  const WelcomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final brand = context.brand;
    final colorScheme = theme.colorScheme;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Column(
            children: [
              SizedBox(height: AppSpacing.lg),
              _Header(theme: theme),
              Divider(
                height: AppSpacing.xl,
                thickness: 1,
                color: brand.divider,
              ),
              SizedBox(height: AppSpacing.md),
              _HeroSection(
                theme: theme,
                brand: brand,
                colorScheme: colorScheme,
              ),
              SizedBox(height: AppSpacing.lg),
              const _RobotIllustration(),
              SizedBox(height: AppSpacing.lg),
              _FeatureHighlights(brand: brand, theme: theme),
              SizedBox(height: AppSpacing.xl),
              _StartButton(
                colorScheme: colorScheme,
                brand: brand,
                onPressed: () => context.push('/login'),
              ),
              SizedBox(height: AppSpacing.md),
              _GuestLink(
                brand: brand,
                onPressed: () async {
                  ref.invalidate(chatControllerProvider);
                  await ref.read(guestSessionGateProvider).enterAsGuest();
                  if (context.mounted) {
                    context.go('/home');
                  }
                },
              ),
              SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.theme});

  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Image.asset(
          'assets/icons/logo.png',
          height: 48,
          semanticLabel: 'Logo ConectaGeração',
        ),
        SizedBox(height: AppSpacing.sm),
        Text(
          'ConectaGeração',
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.onSurface,
          ),
        ),
      ],
    );
  }
}

class _HeroSection extends StatelessWidget {
  const _HeroSection({
    required this.theme,
    required this.brand,
    required this.colorScheme,
  });

  final ThemeData theme;
  final BrandTheme brand;
  final ColorScheme colorScheme;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            style: theme.textTheme.headlineSmall?.copyWith(
              color: AppColors.onSurface,
              height: 1.3,
            ),
            children: [
              const TextSpan(text: 'Use seu celular com\n'),
              TextSpan(
                text: 'mais segurança',
                style: TextStyle(
                  color: colorScheme.primary,
                  fontWeight: FontWeight.bold,
                  fontSize: 28,
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: AppSpacing.sm),
        Text(
          'Vamos te ajudar a evitar erros no dia a dia',
          style: theme.textTheme.bodyLarge?.copyWith(color: brand.subtitle),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

class _RobotIllustration extends StatelessWidget {
  const _RobotIllustration();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 220,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Image.asset(
            'assets/images/nuvem.png',
            height: 200,
            fit: BoxFit.contain,
            semanticLabel: '',
          ),
          Image.asset(
            'assets/images/robo.png',
            height: 180,
            fit: BoxFit.contain,
            semanticLabel: 'Assistente robô do ConectaGeração',
          ),
        ],
      ),
    );
  }
}

class _FeatureHighlights extends StatelessWidget {
  const _FeatureHighlights({required this.brand, required this.theme});

  final BrandTheme brand;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        vertical: AppSpacing.md,
        horizontal: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: brand.cardBackground,
        borderRadius: BorderRadius.circular(brand.borderRadius),
        border: Border.all(color: brand.cardBorder),
        boxShadow: [
          BoxShadow(
            color: brand.cardShadow,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            Expanded(
              child: _FeatureItem(
                iconPath: 'assets/icons/evita-erros.png',
                label: 'Evite erros',
                theme: theme,
              ),
            ),
            VerticalDivider(width: 1, thickness: 1, color: brand.divider),
            Expanded(
              child: _FeatureItem(
                iconPath: 'assets/icons/passo-a-passo.png',
                label: 'Passo a passo fácil de entender',
                theme: theme,
              ),
            ),
            VerticalDivider(width: 1, thickness: 1, color: brand.divider),
            Expanded(
              child: _FeatureItem(
                iconPath: 'assets/icons/mais-seguranca.png',
                label: 'Mais segurança no seu dia a dia',
                theme: theme,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FeatureItem extends StatelessWidget {
  const _FeatureItem({
    required this.iconPath,
    required this.label,
    required this.theme,
  });

  final String iconPath;
  final String label;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Image.asset(iconPath, height: 32, width: 32, semanticLabel: label),
          SizedBox(height: AppSpacing.sm),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.onSurface,
              height: 1.3,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _StartButton extends StatelessWidget {
  const _StartButton({
    required this.colorScheme,
    required this.brand,
    required this.onPressed,
  });

  final ColorScheme colorScheme;
  final BrandTheme brand;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: 'Começar agora',
      child: SizedBox(
        width: double.infinity,
        height: AppSpacing.minTouchTarget,
        child: FilledButton(
          onPressed: onPressed,
          style: FilledButton.styleFrom(
            backgroundColor: colorScheme.primary,
            foregroundColor: colorScheme.onPrimary,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(brand.borderRadius),
            ),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Começar agora',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              SizedBox(width: AppSpacing.xs),
              Icon(Icons.chevron_right, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _GuestLink extends StatelessWidget {
  const _GuestLink({required this.brand, required this.onPressed});

  final BrandTheme brand;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: 'Sem cadastro, sem complicações',
      child: TextButton.icon(
        onPressed: onPressed,
        style: TextButton.styleFrom(foregroundColor: brand.link),
        icon: Image.asset(
          'assets/icons/mais-seguranca.png',
          height: 18,
          width: 18,
          semanticLabel: '',
        ),
        label: const Text(
          'Sem cadastro, sem complicações',
          style: TextStyle(fontWeight: FontWeight.w500),
        ),
      ),
    );
  }
}
