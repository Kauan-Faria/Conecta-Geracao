import 'package:conecta_geracao/features/auth/domain/phone_country.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/phone_auth_controller.dart';
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
      expect(find.text('Continuar'), findsOneWidget);
      expect(find.text('Entra com Email e senha'), findsOneWidget);
      expect(find.text('Se cadastrar com o Google'), findsOneWidget);
      expect(find.text('Entrar sem Cadastro'), findsOneWidget);
      expect(find.text('+55'), findsOneWidget);
    });

    testWidgets('advance button disabled until phone is complete', (
      tester,
    ) async {
      await pumpPhoneLogin(tester);

      final advanceButton = find.widgetWithText(FilledButton, 'Continuar');
      final button = tester.widget<FilledButton>(advanceButton);
      expect(button.onPressed, isNull);

      await tester.enterText(find.byType(TextField).last, '11999999999');
      await tester.pump();

      final enabledButton = tester.widget<FilledButton>(advanceButton);
      expect(enabledButton.onPressed, isNotNull);
    });

    testWidgets('non-Brazil country shows friendly message on advance', (
      tester,
    ) async {
      await pumpPhoneLogin(tester);

      await tester.tap(find.byIcon(Icons.arrow_drop_down));
      await tester.pumpAndSettle();

      final searchField = find.byWidgetPredicate(
        (widget) =>
            widget is TextField &&
            widget.decoration?.hintText == 'Buscar país ou código',
      );
      await tester.enterText(searchField, 'port');
      await tester.pump();

      await tester.tap(find.text('Portugal'));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).last, '912345678');
      await tester.pump();

      await tester.tap(find.widgetWithText(FilledButton, 'Continuar'));
      await tester.pumpAndSettle();

      expect(
        find.textContaining('Cadastro por SMS está disponível apenas'),
        findsOneWidget,
      );
    });

    testWidgets('otp page shows six-box layout and mockup copy', (
      tester,
    ) async {
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

  group('PhoneAuthController', () {
    test('sendCode blocks non-Brazil countries', () async {
      final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(FakeAuthRepository()),
        ],
      );
      addTearDown(container.dispose);

      final controller = container.read(phoneAuthControllerProvider.notifier);
      final portugal = PhoneCountry.all.firstWhere((c) => c.isoCode == 'PT');

      final sent = await controller.sendCode('912345678', country: portugal);

      expect(sent, isFalse);
      expect(
        container.read(phoneAuthControllerProvider).errorMessage,
        PhoneAuthController.nonBrazilSmsMessage,
      );
    });
  });
}
