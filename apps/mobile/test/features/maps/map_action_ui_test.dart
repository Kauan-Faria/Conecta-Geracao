import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:conecta_geracao/features/chat/domain/chat_message.dart';
import 'package:conecta_geracao/features/chat/presentation/widgets/chat_message_bubble.dart';
import 'package:conecta_geracao/features/maps/domain/map_action.dart';
import 'package:conecta_geracao/features/maps/domain/poi_category.dart';
import 'package:conecta_geracao/features/maps/presentation/widgets/map_action_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Map action UI', () {
    testWidgets('ChatMessageBubble shows Ver no mapa when mapAction present', (
      tester,
    ) async {
      var tapped = false;
      final message = ChatMessage(
        id: '1',
        role: MessageRole.assistant,
        content: 'Encontrei farmácias perto.',
        createdAt: DateTime(2026, 6, 1, 10),
        mapAction: const MapAction(category: PoiCategory.pharmacy, radiusKm: 5),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatMessageBubble(
              message: message,
              onOpenMap: () => tapped = true,
            ),
          ),
        ),
      );

      expect(find.text('Ver no mapa'), findsOneWidget);
      await tester.tap(find.byType(AppButton));
      await tester.pump();
      expect(tapped, isTrue);
    });

    testWidgets('ChatMessageBubble hides map button without mapAction', (
      tester,
    ) async {
      final message = ChatMessage(
        id: '1',
        role: MessageRole.assistant,
        content: 'Como posso ajudar?',
        createdAt: DateTime(2026, 6, 1, 10),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatMessageBubble(message: message, onOpenMap: () {}),
          ),
        ),
      );

      expect(find.text('Ver no mapa'), findsNothing);
    });

    testWidgets('MapActionButton meets minimum touch target', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: MapActionButton(
              mapAction: const MapAction(
                category: PoiCategory.pharmacy,
                radiusKm: 5,
              ),
              onPressed: () {},
            ),
          ),
        ),
      );

      final button = tester.getSize(find.byType(AppButton));
      expect(button.height, greaterThanOrEqualTo(48));
    });
  });
}
