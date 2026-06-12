import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:conecta_geracao/features/auth/presentation/guest_session_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_cta_button.dart';
import 'package:conecta_geracao/features/chat/presentation/chat_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class LoginPage extends ConsumerWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      SizedBox(height: AppSpacing.sm),
                      const _LoginHeader(),
                      SizedBox(height: AppSpacing.lg),
                      const _LoginHeroText(),
                      SizedBox(height: AppSpacing.lg),
                      const _LoginIllustration(),
                      SizedBox(height: AppSpacing.lg),
                      const _LoginFeatureHighlights(),
                    ],
                  ),
                ),
              ),
              const _LoginActions(),
            ],
          ),
        ),
      ),
    );
  }
}

class _LoginHeader extends StatelessWidget {
  const _LoginHeader();

  @override
  Widget build(BuildContext context) {
    final brand = context.brand;

    return Column(
      children: [
        Image.asset(
          'assets/icons/logo.png',
          height: 59,
          semanticLabel: 'Logo ConectaGeração',
        ),
        SizedBox(height: AppSpacing.lg),
        Divider(color: brand.divider, height: 1),
      ],
    );
  }
}

class _LoginHeroText extends StatelessWidget {
  const _LoginHeroText();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            style: theme.textTheme.headlineMedium?.copyWith(
              color: AppColors.onSurface,
              fontWeight: FontWeight.w500,
              height: 1.1,
            ),
            children: const [
              TextSpan(text: 'Use seu celular com\n'),
              TextSpan(
                text: 'mais segurança',
                style: TextStyle(
                  color: AppColors.accent,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: AppSpacing.sm),
        Text(
          'Vamos te ajudar a evitar erros no dia a dia',
          textAlign: TextAlign.center,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: AppColors.onSurfaceVariant,
            fontWeight: FontWeight.w600,
            fontSize: 12,
            height: 1.1,
          ),
        ),
      ],
    );
  }
}

class _LoginIllustration extends StatelessWidget {
  const _LoginIllustration();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 220,
      width: double.infinity,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Image.asset(
            'assets/images/nuvem.png',
            fit: BoxFit.contain,
            semanticLabel: '',
          ),
          Image.asset(
            'assets/images/robo.png',
            height: 190,
            fit: BoxFit.contain,
            semanticLabel: 'Assistente Conecta',
          ),
        ],
      ),
    );
  }
}

class _LoginFeatureHighlights extends StatelessWidget {
  const _LoginFeatureHighlights();

  static const _items = [
    _FeatureHighlight(
      iconAsset: 'assets/icons/evita-erros.png',
      label: 'Evite erros',
      semanticLabel: 'Evite erros no uso do celular',
    ),
    _FeatureHighlight(
      iconAsset: 'assets/icons/passo-a-passo.png',
      label: 'Passo a passo fácil de entender',
      semanticLabel: 'Passo a passo fácil de entender',
    ),
    _FeatureHighlight(
      iconAsset: 'assets/icons/mais-seguranca.png',
      label: 'Mais segurança no seu dia a dia',
      semanticLabel: 'Mais segurança no seu dia a dia',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final brand = context.brand;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainer,
        borderRadius: BorderRadius.circular(brand.borderRadius),
        border: Border.all(color: brand.cardBorder),
        boxShadow: [
          BoxShadow(
            color: brand.cardShadow,
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.md,
        ),
        child: Row(
          children: [
            for (var i = 0; i < _items.length; i++) ...[
              if (i > 0)
                Container(
                  width: 1,
                  height: 34,
                  color: brand.divider,
                  margin: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                ),
              Expanded(child: _FeatureHighlightTile(item: _items[i])),
            ],
          ],
        ),
      ),
    );
  }
}

class _FeatureHighlight {
  const _FeatureHighlight({
    required this.iconAsset,
    required this.label,
    required this.semanticLabel,
  });

  final String iconAsset;
  final String label;
  final String semanticLabel;
}

class _FeatureHighlightTile extends StatelessWidget {
  const _FeatureHighlightTile({required this.item});

  final _FeatureHighlight item;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: item.semanticLabel,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Image.asset(item.iconAsset, width: 24, height: 24, semanticLabel: ''),
          SizedBox(height: AppSpacing.xs + 2),
          Text(
            item.label,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: AppColors.onSurface,
              fontWeight: FontWeight.w600,
              fontSize: 9,
              height: 1.1,
            ),
          ),
        ],
      ),
    );
  }
}

class _LoginActions extends ConsumerWidget {
  const _LoginActions();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.md, bottom: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AuthCtaButton(
            label: 'Fazer cadastro',
            semanticLabel: 'Fazer cadastro com número de celular',
            onPressed: () => context.push('/login/phone'),
          ),
          SizedBox(height: AppSpacing.md),
          AuthCtaButton(
            label: 'Continua sem Cadastro',
            semanticLabel: 'Continuar sem cadastro, entrar como convidado',
            variant: AuthCtaVariant.secondary,
            onPressed: () async {
              ref.invalidate(chatControllerProvider);
              await ref.read(guestSessionGateProvider).enterAsGuest();
              if (context.mounted) {
                context.go('/home');
              }
            },
          ),
        ],
      ),
    );
  }
}
