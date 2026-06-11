import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/phone_login_page.dart';
import 'package:conecta_geracao/features/auth/presentation/phone_otp_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/fake_auth_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Phone auth screens', () {
    Future<void> pumpPhoneLogin(WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authRepositoryProvider.overrideWithValue(FakeAuthRepository()),
          ],
          child: const MaterialApp(home: PhoneLoginPage()),
        ),
      );
      await tester.pumpAndSettle();
    }

    testWidgets('phone login shows mockup copy', (tester) async {
      await pumpPhoneLogin(tester);

      expect(find.text('Vamos fazer seu cadastro'), findsOneWidget);
      expect(find.text('Digite seu número de telefone:'), findsOneWidget);
      expect(find.text('Avançar'), findsOneWidget);
      expect(find.text('Se cadastrar de outra forma'), findsOneWidget);
      expect(find.text('+55'), findsOneWidget);
    });

    testWidgets('advance button disabled until phone is complete', (tester) async {
      await pumpPhoneLogin(tester);

      final advanceButton = find.widgetWithText(FilledButton, 'Avançar');
      final button = tester.widget<FilledButton>(advanceButton);
      expect(button.onPressed, isNull);

      await tester.enterText(find.byType(TextField), '11999999999');
      await tester.pump();

      final enabledButton = tester.widget<FilledButton>(advanceButton);
      expect(enabledButton.onPressed, isNotNull);
    });

    testWidgets('otp page shows six-box layout and mockup copy', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authRepositoryProvider.overrideWithValue(FakeAuthRepository()),
          ],
          child: const MaterialApp(
            home: PhoneOtpPage(phoneDigits: '(11) 99999-9999'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Vamos finalizar seu cadastro'), findsOneWidget);
      expect(find.text('Voltar e editar telefone'), findsOneWidget);
      expect(find.text('Avançar'), findsOneWidget);
    });
  });
}
