import 'package:conecta_geracao/features/chat/data/conversation_cache_repository.dart';
import 'package:conecta_geracao/features/chat/domain/chat_message.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('SharedPreferencesConversationCacheRepository', () {
    late SharedPreferences prefs;
    late SharedPreferencesConversationCacheRepository repository;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      prefs = await SharedPreferences.getInstance();
      repository = SharedPreferencesConversationCacheRepository(prefs);
    });

    test('upsertDetail and loadDetail round-trip', () async {
      final detail = ConversationDetail(
        id: 'conv-1',
        topicSlug: 'fazer-pix',
        status: 'in_progress',
        currentStep: 1,
        createdAt: DateTime.utc(2026, 6, 1),
        updatedAt: DateTime.utc(2026, 6, 1, 12),
        messages: [
          ChatMessage(
            id: 'msg-1',
            role: MessageRole.user,
            content: 'Oi',
            createdAt: DateTime.utc(2026, 6, 1, 10),
          ),
        ],
      );

      await repository.upsertDetail(detail);
      final loaded = await repository.loadDetail('conv-1');

      expect(loaded?.id, 'conv-1');
      expect(loaded?.messages, hasLength(1));
    });

    test('keeps only latest conversations up to max', () async {
      for (var i = 0; i < 12; i++) {
        await repository.upsertDetail(
          ConversationDetail(
            id: 'conv-$i',
            topicSlug: null,
            status: 'in_progress',
            currentStep: 0,
            createdAt: DateTime.utc(2026, 6, i + 1),
            updatedAt: DateTime.utc(2026, 6, i + 1, 12),
            messages: const [],
          ),
        );
      }

      final summaries = await repository.loadSummaries();
      expect(summaries.length, 10);
    });
  });
}
