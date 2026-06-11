import 'package:conecta_geracao/core/routing/guest_session_gate.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/data/guest_history_repository.dart';
import 'package:conecta_geracao/features/auth/data/guest_session_repository.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/guest_session_controller.dart';
import 'package:conecta_geracao/features/chat/domain/chat_message.dart';
import 'package:conecta_geracao/features/chat/presentation/chat_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_auth_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Guest chat', () {
    setUp(() async {
      SharedPreferences.setMockInitialValues({});
    });

    test('sendMessage in guest mode does not require API token', () async {
      final prefs = await SharedPreferences.getInstance();
      final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(FakeAuthRepository()),
          sharedPreferencesProvider.overrideWithValue(prefs),
        ],
      );
      addTearDown(container.dispose);

      await container.read(guestSessionGateProvider).enterAsGuest();

      final notifier = container.read(chatControllerProvider.notifier);
      await notifier.sendMessage('Olá');

      final state = container.read(chatControllerProvider);
      expect(state.requiresAuth, isFalse);
      expect(state.messages.length, 2);
      expect(state.messages.first.role, MessageRole.user);
      expect(state.messages.first.content, 'Olá');
      expect(state.messages.last.role, MessageRole.assistant);
      expect(state.messages.last.content, contains('Modo sem cadastro'));
    });

    test('reset clears guest conversation in memory', () async {
      final prefs = await SharedPreferences.getInstance();
      final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(FakeAuthRepository()),
          sharedPreferencesProvider.overrideWithValue(prefs),
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
