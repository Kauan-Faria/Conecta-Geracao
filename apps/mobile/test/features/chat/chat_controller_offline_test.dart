import 'package:conecta_geracao/core/network/connectivity_service.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/chat/data/chat_repository.dart';
import 'package:conecta_geracao/features/chat/data/conversation_cache_repository.dart';
import 'package:conecta_geracao/features/chat/presentation/chat_controller.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/fake_auth_repository.dart';
import '../../helpers/fake_chat_repository.dart';

class FakeConnectivityService extends ConnectivityService {
  FakeConnectivityService(this._online) : super(Connectivity());

  final bool _online;

  @override
  Future<bool> hasConnection() async => _online;
}

void main() {
  group('ChatController offline', () {
    test('blocks send when offline', () async {
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

      final notifier = container.read(chatControllerProvider.notifier);
      notifier.state = notifier.state.copyWith(
        conversationId: 'conv-1',
        isOffline: true,
      );

      await notifier.sendMessage('Oi');

      final state = container.read(chatControllerProvider);
      expect(state.errorMessage, offlineSendMessage);
      expect(fakeChat.sendCalls, 0);
    });
  });
}
