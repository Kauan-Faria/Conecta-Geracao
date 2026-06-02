import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('AppButton meets minimum touch target height', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: AppButton(label: 'Entrar com Google', onPressed: () {}),
        ),
      ),
    );

    final button = tester.getSize(find.byType(FilledButton));
    expect(button.height, greaterThanOrEqualTo(AppSpacing.minTouchTarget));
  });

  testWidgets('AppButton exposes semantic label', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: AppButton(
            label: 'Entrar com Google',
            semanticLabel: 'Entrar com Google',
            onPressed: () {},
          ),
        ),
      ),
    );

    expect(
      tester.getSemantics(find.byType(AppButton)),
      matchesSemantics(
        isButton: true,
        label: 'Entrar com Google',
        hasEnabledState: true,
        isEnabled: true,
      ),
    );
  });
}
