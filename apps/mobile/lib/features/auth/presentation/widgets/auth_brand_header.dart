import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:flutter/material.dart';

/// Cabeçalho de marca reutilizado nas telas internas de autenticação.
class AuthBrandHeader extends StatelessWidget {
  const AuthBrandHeader({this.showDivider = false, super.key});

  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final brand = context.brand;

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
            color: AppColors.onSurface,
            fontWeight: FontWeight.bold,
          ),
        ),
        if (showDivider) ...[
          SizedBox(height: AppSpacing.lg),
          Divider(color: brand.divider, height: 1),
        ],
      ],
    );
  }
}
