import 'package:conecta_geracao/features/chat/domain/tts_speakable_text.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('sanitizeForTts', () {
    test('returns plain prose as speakable', () {
      final result = sanitizeForTts('Olá, posso ajudar com o WhatsApp?');

      expect(result.isSpeakable, isTrue);
      expect(result.text, 'Olá, posso ajudar com o WhatsApp?');
    });

    test('strips markdown emphasis and headings', () {
      final result = sanitizeForTts('## **Atenção**\nToque em _Configurações_');

      expect(result.isSpeakable, isTrue);
      expect(result.text, 'Atenção Toque em Configurações');
    });

    test('keeps link label and omits raw URLs', () {
      final result = sanitizeForTts(
        'Veja o [guia](https://exemplo.com/muito/longo/caminho) e '
        'https://outro.exemplo.com/path',
      );

      expect(result.isSpeakable, isTrue);
      expect(result.text, 'Veja o guia e');
      expect(result.text.contains('http'), isFalse);
    });

    test('removes fenced and inline code blocks', () {
      final result = sanitizeForTts(
        'Use o comando:\n```\nadb devices\n```\nou `settings`.',
      );

      expect(result.isSpeakable, isTrue);
      expect(result.text.contains('adb'), isFalse);
      expect(result.text, contains('Use o comando'));
      expect(result.text, contains('settings'));
    });

    test('skips empty after sanitizing emoji-only text', () {
      final result = sanitizeForTts('😀🎉✨');

      expect(result.isSpeakable, isFalse);
      expect(result.text, isEmpty);
    });

    test('skips empty whitespace', () {
      final result = sanitizeForTts('   \n\t  ');

      expect(result.isSpeakable, isFalse);
    });

    test('skips JSON object payloads', () {
      final result = sanitizeForTts('{"error":"timeout","code":504}');

      expect(result.isSpeakable, isFalse);
    });

    test('skips JSON array payloads', () {
      final result = sanitizeForTts('[{"id":"1"},{"id":"2"}]');

      expect(result.isSpeakable, isFalse);
    });

    test('skips UUID-like technical ids', () {
      final result = sanitizeForTts('550e8400-e29b-41d4-a716-446655440000');

      expect(result.isSpeakable, isFalse);
    });

    test('skips long alphanumeric ids without spaces', () {
      final result = sanitizeForTts('msg_abc123XYZ7890long');

      expect(result.isSpeakable, isFalse);
    });

    test('skips system / technical error literals', () {
      final result = sanitizeForTts(
        'Internal Server Error — stack trace disponível',
      );

      expect(result.isSpeakable, isFalse);
    });

    test('strips list markers while keeping readable text', () {
      final result = sanitizeForTts('- Abra o app\n1. Toque em Conta');

      expect(result.isSpeakable, isTrue);
      expect(result.text, 'Abra o app Toque em Conta');
    });
  });
}
