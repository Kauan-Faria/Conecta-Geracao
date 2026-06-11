import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_brand_header.dart';
import 'package:flutter/material.dart';

/// Layout base das telas internas de auth — sem AppBar, com header de marca.
class AuthScreenScaffold extends StatelessWidget {
  const AuthScreenScaffold({
    required this.body,
    this.bottom,
    this.showBrandDivider = false,
    super.key,
  });

  final Widget body;
  final Widget? bottom;
  final bool showBrandDivider;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Column(
            children: [
              SizedBox(height: AppSpacing.sm),
              AuthBrandHeader(showDivider: showBrandDivider),
              SizedBox(height: AppSpacing.xl),
              Expanded(
                child: SingleChildScrollView(child: body),
              ),
              if (bottom != null) bottom!,
            ],
          ),
        ),
      ),
    );
  }
}
