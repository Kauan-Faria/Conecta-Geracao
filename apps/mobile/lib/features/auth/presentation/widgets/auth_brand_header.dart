import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/theme/brand_theme_extension.dart';
import 'package:flutter/material.dart';

/// Cabeçalho de marca reutilizado nas telas internas de autenticação.
class AuthBrandHeader extends StatelessWidget {
  const AuthBrandHeader({this.showDivider = true, super.key});

  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    final brand = context.brand;

    return Column(
      children: [
        Image.asset(
          'assets/icons/logo.png',
          height: 56,
          semanticLabel: 'Logo ConectaGeração',
        ),
        if (showDivider) ...[
          SizedBox(height: AppSpacing.lg),
          Divider(color: brand.divider, height: 1),
        ],
      ],
    );
  }
}
