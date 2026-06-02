import 'package:conecta_geracao/core/theme/accessibility_extension.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:flutter/material.dart';

class AppScaffold extends StatelessWidget {
  const AppScaffold({
    required this.title,
    required this.body,
    this.actions,
    super.key,
  });

  final String title;
  final Widget body;
  final List<Widget>? actions;

  @override
  Widget build(BuildContext context) {
    final accessibility = Theme.of(context).extension<AccessibilityTheme>();
    final spacingScale = accessibility?.spacingScale ?? 1.0;
    final padding = AppSpacing.md * spacingScale;

    return Scaffold(
      appBar: AppBar(title: Text(title), actions: actions),
      body: SafeArea(
        child: Padding(padding: EdgeInsets.all(padding), child: body),
      ),
    );
  }
}
