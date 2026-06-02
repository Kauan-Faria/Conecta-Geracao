import 'package:conecta_geracao/features/chat/domain/chat_message.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('ChatMessage.fromJson parses assistant message', () {
    final message = ChatMessage.fromJson({
      'id': 'msg-1',
      'role': 'assistant',
      'content': 'Olá! Como posso ajudar?',
      'createdAt': '2026-06-01T10:24:00.000Z',
    });

    expect(message.id, 'msg-1');
    expect(message.role, MessageRole.assistant);
    expect(message.content, 'Olá! Como posso ajudar?');
    expect(message.createdAt.toUtc().hour, 10);
  });
}
