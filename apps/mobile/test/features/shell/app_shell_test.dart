import 'package:conecta_geracao/app.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_auth_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('App shell navigation', () {
    setUp(() async {
      SharedPreferences.setMockInitialValues({});
    });

    testWidgets('authenticated user sees main navigation destinations', (
      tester,
    ) async {
      final fakeAuth = FakeAuthRepository(initialUser: authenticatedTestUser);
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

      expect(find.text('Início'), findsWidgets);
      expect(find.text('Chat'), findsWidgets);
      expect(find.text('Configurações'), findsWidgets);
    });
  });
}
