import 'package:conecta_geracao/app.dart';
import 'package:conecta_geracao/core/network/connectivity_service.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/chat/data/chat_repository.dart';
import 'package:conecta_geracao/features/chat/data/conversation_cache_repository.dart';
import 'package:conecta_geracao/features/chat/presentation/chat_controller.dart';
import 'package:conecta_geracao/features/notifications/presentation/notifications_providers.dart';
import 'package:conecta_geracao/features/notifications/presentation/notifications_bootstrap.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_auth_repository.dart';
import '../../helpers/fake_chat_repository.dart';
import '../../helpers/fake_notifications_remote_port.dart';
import '../../helpers/fake_push_messaging_client.dart';

class _OnlineConnectivityService extends ConnectivityService {
  _OnlineConnectivityService() : super(Connectivity());

  @override
  Future<bool> hasConnection() async => true;
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('ChatPage', () {
    late FakeChatRepository fakeChat;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      fakeChat = FakeChatRepository();
    });

    Future<void> pumpChat(WidgetTester tester) async {
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
            pushMessagingClientProvider.overrideWithValue(
              FakePushMessagingClient(authorized: true, token: 'fake-token'),
            ),
            notificationsApiProvider.overrideWithValue(
              FakeNotificationsRemotePort(),
            ),
            notificationsBootstrapProvider.overrideWith((ref) => Future.value()),
          ],
          child: const ConectaGeracaoApp(),
        ),
      );

      await tester.pumpAndSettle();
      await tester.tap(find.text('Chat'));
      await tester.pumpAndSettle();
    }

    testWidgets('authenticated user sees chat hero and input', (tester) async {
      await pumpChat(tester);

      expect(find.text('Converse com o Conecta'), findsOneWidget);
      expect(find.text('Digite sua mensagem...'), findsOneWidget);
      expect(find.text('Gravar'), findsOneWidget);
      expect(find.text('Escolha um assunto para começar'), findsOneWidget);
      expect(find.text('PIX'), findsOneWidget);
      expect(find.text('Golpe'), findsOneWidget);
    });

    testWidgets('tapping topic shortcut starts conversation with slug', (
      tester,
    ) async {
      await pumpChat(tester);

      await tester.tap(find.text('PIX'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));
      await tester.pumpAndSettle();

      expect(fakeChat.createCalls, 1);
      expect(fakeChat.lastCreateTopicSlug, 'fazer-pix');
      expect(fakeChat.lastSentContent, 'Desejo fazer um PIX');
      expect(find.text('Desejo fazer um PIX'), findsOneWidget);
    });

    testWidgets('sending message shows user bubble and checkpoint buttons', (
      tester,
    ) async {
      await pumpChat(tester);

      await tester.enterText(find.byType(TextField), 'Quero enviar um pix');
      await tester.testTextInput.receiveAction(TextInputAction.send);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));
      await tester.pumpAndSettle();

      expect(find.text('Quero enviar um pix'), findsOneWidget);
      expect(fakeChat.sendCalls, 1);
      expect(find.text('Sim'), findsOneWidget);
      expect(find.text('Não'), findsOneWidget);
    });

    testWidgets('checkpoint Sim sends affirmative reply', (tester) async {
      fakeChat = FakeChatRepository(assistantReply: 'Conseguiu fazer isso?');

      await pumpChat(tester);

      await tester.enterText(find.byType(TextField), 'Oi');
      await tester.testTextInput.receiveAction(TextInputAction.send);
      await tester.pumpAndSettle();

      await tester.tap(find.text('Sim'));
      await tester.pumpAndSettle();

      expect(fakeChat.lastSentContent, 'Sim');
    });

    testWidgets('guest can use chat without login', (tester) async {
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
            pushMessagingClientProvider.overrideWithValue(
              FakePushMessagingClient(authorized: true, token: 'fake-token'),
            ),
            notificationsApiProvider.overrideWithValue(
              FakeNotificationsRemotePort(),
            ),
            notificationsBootstrapProvider.overrideWith((ref) => Future.value()),
          ],
          child: const ConectaGeracaoApp(),
        ),
      );

      await tester.pumpAndSettle();
      await tester.tap(find.text('Continua sem Cadastro'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Chat'));
      await tester.pumpAndSettle();

      expect(find.textContaining('Modo sem cadastro'), findsOneWidget);
      expect(find.text('Digite sua mensagem...'), findsOneWidget);
    });
  });
}
