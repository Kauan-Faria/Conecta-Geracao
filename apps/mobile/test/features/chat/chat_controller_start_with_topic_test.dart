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

class FakeConnectivityService extends ConnectivityService {
  FakeConnectivityService(this._online) : super(Connectivity());

  final bool _online;

  @override
  Future<bool> hasConnection() async => _online;
}

void main() {
  group('ChatController.startWithTopic', () {
    test('creates conversation with topicSlug and sends starter message', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final fakeChat = FakeChatRepository();

      final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(
            FakeAuthRepository(initialUser: authenticatedTestUser),
          ),
          sharedPreferencesProvider.overrideWithValue(prefs),
          cachedChatRepositoryProvider.overrideWithValue(
            CachedChatRepository(
              remote: fakeChat,
              cache: SharedPreferencesConversationCacheRepository(prefs),
            ),
          ),
          connectivityServiceProvider.overrideWithValue(
            FakeConnectivityService(true),
          ),
        ],
      );
      addTearDown(container.dispose);

      final notifier = container.read(chatControllerProvider.notifier);
      await notifier.startWithTopic('fazer-pix');

      final state = container.read(chatControllerProvider);
      expect(fakeChat.createCalls, 1);
      expect(fakeChat.lastCreateTopicSlug, 'fazer-pix');
      expect(fakeChat.sendCalls, 1);
      expect(fakeChat.lastSentContent, 'Desejo fazer um PIX');
      expect(state.conversationId, 'conv-test-1');
      expect(state.messages, hasLength(2));
      expect(state.messages.first.content, 'Desejo fazer um PIX');
      expect(state.isSending, isFalse);
    });

    test('blocks start when offline', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final fakeChat = FakeChatRepository();

      final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(
            FakeAuthRepository(initialUser: authenticatedTestUser),
          ),
          sharedPreferencesProvider.overrideWithValue(prefs),
          cachedChatRepositoryProvider.overrideWithValue(
            CachedChatRepository(
              remote: fakeChat,
              cache: SharedPreferencesConversationCacheRepository(prefs),
            ),
          ),
          connectivityServiceProvider.overrideWithValue(
            FakeConnectivityService(false),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(chatControllerProvider.notifier).startWithTopic(
            'fazer-pix',
          );

      final state = container.read(chatControllerProvider);
      expect(fakeChat.createCalls, 0);
      expect(state.errorMessage, offlineSendMessage);
    });
  });
}
