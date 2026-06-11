import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/auth_cta_button.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/otp_pin_input.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('AuthCtaButton', () {
    testWidgets('meets minimum touch target height', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AuthCtaButton(label: 'Avançar', onPressed: () {}),
          ),
        ),
      );

      final button = tester.getSize(find.byType(FilledButton));
      expect(button.height, greaterThanOrEqualTo(AppSpacing.minTouchTarget));
    });

    testWidgets('exposes semantic label', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AuthCtaButton(
              label: 'Avançar',
              semanticLabel: 'Avançar e receber código por SMS',
              onPressed: () {},
            ),
          ),
        ),
      );

      expect(
        tester.getSemantics(find.byType(AuthCtaButton)),
        matchesSemantics(
          isButton: true,
          label: 'Avançar e receber código por SMS',
          hasEnabledState: true,
          isEnabled: true,
        ),
      );
    });

    testWidgets('primary variant uses arrow_circle_right icon', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AuthCtaButton(label: 'Avançar', onPressed: () {}),
          ),
        ),
      );

      expect(find.byIcon(Icons.arrow_circle_right), findsOneWidget);
    });
  });

  group('OtpPinInput', () {
    testWidgets('renders six pin boxes', (tester) async {
      final controller = TextEditingController();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: OtpPinInput(controller: controller),
          ),
        ),
      );

      expect(find.text('0'), findsNothing);
      expect(find.byType(TextField), findsOneWidget);
    });

    testWidgets('updates visible digits when controller changes', (tester) async {
      final controller = TextEditingController();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: OtpPinInput(controller: controller),
          ),
        ),
      );

      controller.text = '123';
      await tester.pump();

      expect(find.text('1'), findsOneWidget);
      expect(find.text('2'), findsOneWidget);
      expect(find.text('3'), findsOneWidget);
    });
  });
}
