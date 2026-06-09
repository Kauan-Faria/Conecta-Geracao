import 'package:conecta_geracao/app.dart';
import 'package:conecta_geracao/core/network/connectivity_service.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/chat/data/chat_repository.dart';
import 'package:conecta_geracao/features/chat/data/conversation_cache_repository.dart';
import 'package:conecta_geracao/features/chat/presentation/chat_controller.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_auth_repository.dart';
import '../../helpers/fake_chat_repository.dart';

class _OnlineConnectivityService extends ConnectivityService {
  _OnlineConnectivityService() : super(Connectivity());

  @override
  Future<bool> hasConnection() async => true;
}

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
      final fakeChat = FakeChatRepository();
      final sharedPreferences = await SharedPreferences.getInstance();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authRepositoryProvider.overrideWithValue(fakeAuth),
            cachedChatRepositoryProvider.overrideWithValue(
              CachedChatRepository(
                remote: fakeChat,
                cache: SharedPreferencesConversationCacheRepository(
                  sharedPreferences,
                ),
              ),
            ),
            connectivityServiceProvider.overrideWithValue(
              _OnlineConnectivityService(),
            ),
            sharedPreferencesProvider.overrideWithValue(sharedPreferences),
          ],
          child: const ConectaGeracaoApp(),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Início'), findsWidgets);
      expect(find.text('Mapas'), findsWidgets);
      expect(find.text('Chat'), findsWidgets);
      expect(find.text('Configurações'), findsWidgets);
    });
  });
}
