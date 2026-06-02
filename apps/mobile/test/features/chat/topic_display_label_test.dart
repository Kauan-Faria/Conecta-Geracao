import 'package:conecta_geracao/features/chat/domain/chat_message.dart';
import 'package:conecta_geracao/features/chat/domain/topic_display_label.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('topic display labels', () {
    test('maps known topic slug', () {
      expect(topicDisplayLabel('fazer-pix'), 'Fazer Pix');
    });

    test('uses first user message when topic slug is null', () {
      final title = conversationListTitle(
        topicSlug: null,
        messages: [
          ChatMessage(
            id: '1',
            role: MessageRole.user,
            content: 'Preciso de ajuda com o Pix no banco',
            createdAt: DateTime.utc(2026, 6, 1),
          ),
        ],
      );

      expect(title, contains('Pix'));
    });
  });
}
