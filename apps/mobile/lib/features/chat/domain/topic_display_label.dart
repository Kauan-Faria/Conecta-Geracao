import 'package:conecta_geracao/features/chat/domain/chat_message.dart';

String topicDisplayLabel(String? topicSlug) {
  if (topicSlug == null || topicSlug.isEmpty) {
    return 'Conversa';
  }

  const labels = <String, String>{
    'fazer-pix': 'Fazer Pix',
    'codigo-govbr': 'Código Gov.br',
    'whatsapp-contato-localizacao': 'WhatsApp e localização',
    'wifi-qr-code': 'Wi-Fi e QR Code',
    'segunda-via-boleto': 'Segunda via de boleto',
    'alerta-golpe': 'Alerta de golpe',
  };

  return labels[topicSlug] ?? topicSlug.replaceAll('-', ' ');
}

String conversationListTitle({
  required String? topicSlug,
  List<ChatMessage> messages = const [],
}) {
  if (topicSlug != null && topicSlug.isNotEmpty) {
    return topicDisplayLabel(topicSlug);
  }

  for (final message in messages) {
    if (message.role == MessageRole.user && message.content.isNotEmpty) {
      return _truncate(message.content, 48);
    }
  }

  return 'Conversa';
}

String _truncate(String value, int maxLength) {
  if (value.length <= maxLength) {
    return value;
  }
  return '${value.substring(0, maxLength - 1)}…';
}
