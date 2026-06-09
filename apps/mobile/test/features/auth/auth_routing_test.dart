import 'package:conecta_geracao/app.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_auth_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Auth routing', () {
    setUp(() async {
      SharedPreferences.setMockInitialValues({});
    });

    Future<void> pumpApp(WidgetTester tester) async {
      tester.view.physicalSize = const Size(400, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final fakeAuth = FakeAuthRepository();
      final sharedPreferences = await SharedPreferences.getInstance();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authRepositoryProvider.overrideWithValue(fakeAuth),
            sharedPreferencesProvider.overrideWithValue(sharedPreferences),
          ],
          child: const ConectaGeracaoApp(),
        ),
      );

      await tester.pumpAndSettle();
    }

    Future<void> scrollTo(WidgetTester tester, Finder finder) async {
      await tester.scrollUntilVisible(
        finder,
        100,
        scrollable: find.byType(Scrollable).first,
      );
    }

    testWidgets('unauthenticated user sees welcome page', (tester) async {
      await pumpApp(tester);

      expect(find.text('Começar agora'), findsOneWidget);
      expect(find.text('Sem cadastro, sem complicações'), findsOneWidget);
    });

    testWidgets('guest user reaches home without login', (tester) async {
      await pumpApp(tester);

      await scrollTo(tester, find.text('Sem cadastro, sem complicações'));
      await tester.tap(find.text('Sem cadastro, sem complicações'));
      await tester.pumpAndSettle();

      expect(find.text('Antes de fazer algo importante...'), findsOneWidget);
      expect(find.text('Quero ajuda agora'), findsOneWidget);
    });

    testWidgets('start button opens login page', (tester) async {
      await pumpApp(tester);

      await scrollTo(tester, find.text('Começar agora'));
      await tester.tap(find.text('Começar agora'));
      await tester.pumpAndSettle();

      expect(find.text('Receber código'), findsOneWidget);
      expect(find.text('Entrar de outra forma'), findsOneWidget);
    });
  });
}
