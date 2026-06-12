import 'package:conecta_geracao/app.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/data/guest_session_repository.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/notifications/presentation/notifications_bootstrap.dart';
import 'package:conecta_geracao/features/notifications/presentation/notifications_providers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_auth_repository.dart';
import '../../helpers/fake_notifications_remote_port.dart';
import '../../helpers/fake_push_messaging_client.dart';

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
            pushMessagingClientProvider.overrideWithValue(
              FakePushMessagingClient(),
            ),
            notificationsApiProvider.overrideWithValue(
              FakeNotificationsRemotePort(),
            ),
            notificationsBootstrapProvider.overrideWith(
              (ref) => Future.value(),
            ),
          ],
          child: const ConectaGeracaoApp(),
        ),
      );

      await tester.pumpAndSettle();
    }

    testWidgets('unauthenticated user sees login page', (tester) async {
      await pumpApp(tester);

      expect(find.text('Fazer cadastro'), findsOneWidget);
      expect(find.text('Continua sem Cadastro'), findsOneWidget);
      expect(find.text('Evite erros'), findsOneWidget);
      expect(find.text('Avançar'), findsNothing);
    });

    testWidgets('register button opens phone login', (tester) async {
      await pumpApp(tester);

      await tester.tap(find.text('Fazer cadastro'));
      await tester.pumpAndSettle();

      expect(find.text('Vamos fazer seu cadastro'), findsOneWidget);
      expect(find.text('Continuar'), findsOneWidget);
    });

    testWidgets('phone screen opens email sign-in route', (tester) async {
      await pumpApp(tester);

      await tester.tap(find.text('Fazer cadastro'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Entra com Email e senha'));
      await tester.pumpAndSettle();

      expect(find.text('Entrar com email e senha'), findsOneWidget);
      expect(find.text('Digite seu Email:'), findsOneWidget);
      expect(find.text('Não possuo Cadastro'), findsOneWidget);
    });

    testWidgets('legacy alternative route redirects to email signup', (
      tester,
    ) async {
      await pumpApp(tester);

      await tester.tap(find.text('Fazer cadastro'));
      await tester.pumpAndSettle();

      final context = tester.element(find.text('Vamos fazer seu cadastro'));
      GoRouter.of(context).go('/login/alternative');
      await tester.pumpAndSettle();

      expect(find.text('Vamos fazer seu cadastro'), findsOneWidget);
      expect(find.text('Digite seu Email:'), findsOneWidget);
      expect(find.text('Confirme sua senha:'), findsOneWidget);
    });

    testWidgets('guest from phone screen reaches home', (tester) async {
      await pumpApp(tester);

      await tester.tap(find.text('Fazer cadastro'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Entrar sem Cadastro'));
      await tester.pumpAndSettle();

      expect(find.text('Antes de fazer algo importante...'), findsOneWidget);
    });

    testWidgets('guest user reaches home without login', (tester) async {
      await pumpApp(tester);

      await tester.tap(find.text('Continua sem Cadastro'));
      await tester.pumpAndSettle();

      expect(find.text('Antes de fazer algo importante...'), findsOneWidget);
      expect(find.text('Quero ajuda agora'), findsOneWidget);
    });

    testWidgets('legacy guest prefs do not restore session on cold start', (
      tester,
    ) async {
      SharedPreferences.setMockInitialValues({
        GuestSessionLegacyCleaner.guestSessionStartedAtKey:
            DateTime.now().millisecondsSinceEpoch,
      });

      await pumpApp(tester);

      expect(find.text('Fazer cadastro'), findsOneWidget);
      expect(find.text('Antes de fazer algo importante...'), findsNothing);
    });
  });
}
