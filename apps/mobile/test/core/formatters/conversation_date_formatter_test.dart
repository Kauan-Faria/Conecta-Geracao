import 'package:conecta_geracao/core/formatters/conversation_date_formatter.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('formatRecentConversationDate', () {
    test('formats older dates as dd/mm, hh:mm', () {
      final value = DateTime(2025, 3, 15, 8, 5);
      expect(formatRecentConversationDate(value), '15/03, 08:05');
    });
  });
}
