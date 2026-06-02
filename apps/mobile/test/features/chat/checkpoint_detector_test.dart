import 'package:conecta_geracao/features/chat/domain/chat_message.dart';
import 'package:conecta_geracao/features/chat/domain/checkpoint_detector.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final assistantQuestion = ChatMessage(
    id: '1',
    role: MessageRole.assistant,
    content: 'Vamos conferir juntos?',
    createdAt: DateTime.utc(2026, 6, 1),
  );

  final userReply = ChatMessage(
    id: '2',
    role: MessageRole.user,
    content: 'Sim',
    createdAt: DateTime.utc(2026, 6, 1),
  );

  group('shouldShowCheckpointQuickReplies', () {
    test('shows when last assistant message is a question', () {
      expect(
        shouldShowCheckpointQuickReplies(
          messages: [assistantQuestion],
          isSending: false,
          conversationStatus: 'in_progress',
        ),
        isTrue,
      );
    });

    test('hides while sending', () {
      expect(
        shouldShowCheckpointQuickReplies(
          messages: [assistantQuestion],
          isSending: true,
          conversationStatus: 'in_progress',
        ),
        isFalse,
      );
    });

    test('hides when last message is from user', () {
      expect(
        shouldShowCheckpointQuickReplies(
          messages: [assistantQuestion, userReply],
          isSending: false,
          conversationStatus: 'in_progress',
        ),
        isFalse,
      );
    });

    test('hides when conversation is completed', () {
      expect(
        shouldShowCheckpointQuickReplies(
          messages: [assistantQuestion],
          isSending: false,
          conversationStatus: 'completed',
        ),
        isFalse,
      );
    });
  });
}
