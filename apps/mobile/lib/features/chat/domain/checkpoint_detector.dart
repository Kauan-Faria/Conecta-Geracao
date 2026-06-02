import 'package:conecta_geracao/features/chat/domain/chat_message.dart';

/// Detecta se a última mensagem do assistente pede resposta de checkpoint.
bool shouldShowCheckpointQuickReplies({
  required List<ChatMessage> messages,
  required bool isSending,
  required String conversationStatus,
}) {
  if (isSending || conversationStatus != 'in_progress') {
    return false;
  }
  if (messages.isEmpty) {
    return false;
  }

  final last = messages.last;
  if (last.role != MessageRole.assistant) {
    return false;
  }

  final normalized = last.content.toLowerCase();
  if (normalized.contains('?')) {
    return true;
  }

  const checkpointPhrases = [
    'conseguiu',
    'conferir juntos',
    'vamos conferir',
    'consegui fazer',
    'deu certo',
    'conseguiu fazer',
  ];

  return checkpointPhrases.any(normalized.contains);
}
