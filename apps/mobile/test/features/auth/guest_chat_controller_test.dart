import 'package:conecta_geracao/core/network/api_client.dart';
import 'package:conecta_geracao/core/network/connectivity_service.dart';
import 'package:conecta_geracao/core/routing/guest_session_gate.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/data/guest_history_repository.dart';
import 'package:conecta_geracao/features/auth/data/guest_session_repository.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/guest_session_controller.dart';
import 'package:conecta_geracao/features/chat/data/conversations_api.dart';
import 'package:conecta_geracao/features/chat/domain/chat_message.dart';
import 'package:conecta_geracao/features/chat/presentation/chat_controller.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_auth_repository.dart';

class _FakeConversationsApi extends ConversationsApi {
  _FakeConversationsApi()
    : super(ApiClient(getIdToken: () async => null));

  String? lastGuestContent;
  List<GuestMessageTurn>? lastGuestHistory;

  @override
  Future<GuestAssistantReply> sendGuestMessage({
    required String content,
    String? topicSlug,
    int currentStep = 0,
    List<GuestMessageTurn> messageHistory = const [],
  }) async {
    lastGuestContent = content;
    lastGuestHistory = messageHistory;
    return GuestAssistantReply(
      id: 'guest-assistant-1',
      content: 'Vou te ajudar a encontrar uma farmácia perto de você.',
      currentStep: 0,
      createdAt: DateTime.utc(2026, 6, 12, 14, 44),
      message: ChatMessage(
        id: 'guest-assistant-1',
        role: MessageRole.assistant,
        content: 'Vou te ajudar a encontrar uma farmácia perto de você.',
        createdAt: DateTime.utc(2026, 6, 12, 14, 44),
      ),
    );
  }
}

class _OnlineConnectivityService extends ConnectivityService {
  _OnlineConnectivityService() : super(Connectivity());

  @override
  Future<bool> hasConnection() async => true;
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Guest chat', () {
    setUp(() async {
      SharedPreferences.setMockInitialValues({});
    });

    test('sendMessage in guest mode uses guest chat API without auth token', () async {
      final prefs = await SharedPreferences.getInstance();
      final fakeApi = _FakeConversationsApi();
      final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(FakeAuthRepository()),
          sharedPreferencesProvider.overrideWithValue(prefs),
          conversationsApiProvider.overrideWithValue(fakeApi),
          connectivityServiceProvider.overrideWithValue(
            _OnlineConnectivityService(),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(guestSessionGateProvider).enterAsGuest();

      final notifier = container.read(chatControllerProvider.notifier);
      await notifier.sendMessage('quero uma farmácia perto');

      final state = container.read(chatControllerProvider);
      expect(state.requiresAuth, isFalse);
      expect(state.messages.length, 2);
      expect(state.messages.first.role, MessageRole.user);
      expect(state.messages.first.content, 'quero uma farmácia perto');
      expect(state.messages.last.role, MessageRole.assistant);
      expect(
        state.messages.last.content,
        'Vou te ajudar a encontrar uma farmácia perto de você.',
      );
      expect(fakeApi.lastGuestContent, 'quero uma farmácia perto');
      expect(fakeApi.lastGuestHistory, isEmpty);
    });

    test('reset clears guest conversation in memory', () async {
      final prefs = await SharedPreferences.getInstance();
      final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(FakeAuthRepository()),
          sharedPreferencesProvider.overrideWithValue(prefs),
          conversationsApiProvider.overrideWithValue(_FakeConversationsApi()),
          connectivityServiceProvider.overrideWithValue(
            _OnlineConnectivityService(),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(guestSessionGateProvider).enterAsGuest();
      final notifier = container.read(chatControllerProvider.notifier);
      await notifier.sendMessage('Teste');
      notifier.resetForNewConversation();

      expect(container.read(chatControllerProvider).messages, isEmpty);
    });

    test('guest session is inactive on fresh gate after cold start', () async {
      final session = InMemoryGuestSessionRepository();
      final history = InMemoryGuestHistoryRepository();
      final gate = GuestSessionGate(
        sessionRepository: session,
        historyRepository: history,
      );
      addTearDown(gate.dispose);

      await gate.enterAsGuest();
      expect(gate.isGuestActive, isTrue);

      final freshGate = GuestSessionGate(
        sessionRepository: InMemoryGuestSessionRepository(),
        historyRepository: InMemoryGuestHistoryRepository(),
      );
      addTearDown(freshGate.dispose);
      await freshGate.refresh();

      expect(freshGate.isGuestActive, isFalse);
    });
  });
}
