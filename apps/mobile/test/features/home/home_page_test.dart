import 'package:conecta_geracao/app.dart';
import 'package:conecta_geracao/core/network/connectivity_service.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/chat/data/chat_repository.dart';
import 'package:conecta_geracao/features/chat/data/conversation_cache_repository.dart';
import 'package:conecta_geracao/features/chat/presentation/chat_controller.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
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

  group('HomePage', () {
    late FakeChatRepository fakeChat;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      fakeChat = FakeChatRepository();
    });

    Future<void> pumpHome(WidgetTester tester) async {
      tester.view.physicalSize = const Size(400, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final fakeAuth = FakeAuthRepository(initialUser: authenticatedTestUser);
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
    }

    testWidgets('authenticated user sees home hub layout', (tester) async {
      await pumpHome(tester);

      expect(find.bySemanticsLabel('Logo ConectaGeração'), findsOneWidget);
      expect(find.text('Antes de fazer algo importante...'), findsOneWidget);
      expect(find.text('Quero ajuda agora'), findsOneWidget);
      expect(find.text('O que você quer fazer?'), findsOneWidget);
      expect(find.text('Fazer um PIX'), findsOneWidget);
      expect(find.text('Verificações recentes'), findsOneWidget);
      expect(find.text('Ver todas'), findsOneWidget);
    });

    testWidgets('"Quero ajuda agora" opens empty chat without sending', (
      tester,
    ) async {
      await pumpHome(tester);

      await tester.tap(find.text('Quero ajuda agora'));
      await tester.pumpAndSettle();

      expect(find.text('Escolha um assunto para começar'), findsOneWidget);
      expect(fakeChat.createCalls, 0);
      expect(fakeChat.sendCalls, 0);
    });

    testWidgets('quick action starts chat with topic starter message', (
      tester,
    ) async {
      await pumpHome(tester);

      await tester.tap(find.text('Fazer um PIX'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));
      await tester.pumpAndSettle();

      expect(fakeChat.createCalls, 1);
      expect(fakeChat.lastCreateTopicSlug, 'fazer-pix');
      expect(fakeChat.lastSentContent, 'Desejo fazer um PIX');
      expect(find.text('Desejo fazer um PIX'), findsOneWidget);
    });

    testWidgets('"Ver todas" opens conversation list', (tester) async {
      await pumpHome(tester);

      await tester.ensureVisible(find.text('Ver todas'));
      await tester.tap(find.text('Ver todas'));
      await tester.pumpAndSettle();

      expect(find.text('Minhas conversas'), findsOneWidget);
    });

    testWidgets('recent conversation opens chat on tap', (tester) async {
      await pumpHome(tester);
      await tester.pumpAndSettle();

      final recentTile = find.bySemanticsLabel(RegExp(r'Abrir conversa .*'));
      expect(recentTile, findsOneWidget);

      await tester.ensureVisible(recentTile);
      await tester.tap(recentTile);
      await tester.pumpAndSettle();

      expect(fakeChat.getCalls, greaterThanOrEqualTo(1));
      expect(find.text('Digite sua mensagem...'), findsOneWidget);
    });
  });
}
