import 'package:conecta_geracao/features/chat/domain/topic_shortcuts.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('mvpTopicShortcuts', () {
    test('contains 6 MVP topics with short labels from story', () {
      expect(mvpTopicShortcuts, hasLength(6));
      expect(mvpTopicShortcuts.map((s) => s.shortLabel).toList(), [
        'PIX',
        'Gov.br',
        'WhatsApp',
        'Wi-Fi',
        'Boleto',
        'Golpe',
      ]);
    });

    test('topicShortcutForSlug resolves known slug', () {
      final shortcut = topicShortcutForSlug('fazer-pix');
      expect(shortcut?.shortLabel, 'PIX');
      expect(shortcut?.actionLabel, 'Fazer um PIX');
      expect(shortcut?.starterMessage, 'Desejo fazer um PIX');
    });

    test('topicShortcutForSlug returns null for unknown slug', () {
      expect(topicShortcutForSlug('unknown'), isNull);
    });
  });
}
