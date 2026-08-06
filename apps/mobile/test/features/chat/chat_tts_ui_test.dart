import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/features/chat/domain/chat_message.dart';
import 'package:conecta_geracao/features/chat/domain/tts_playback_state.dart';
import 'package:conecta_geracao/features/chat/presentation/widgets/chat_hero_header.dart';
import 'package:conecta_geracao/features/chat/presentation/widgets/chat_message_bubble.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('ChatMessageBubble TTS', () {
    testWidgets('shows Ouvir control for assistant when enabled', (
      tester,
    ) async {
      var tapped = false;
      final message = ChatMessage(
        id: 'a1',
        role: MessageRole.assistant,
        content: 'Olá',
        createdAt: DateTime(2026, 8, 6, 12),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatMessageBubble(
              message: message,
              showTtsControls: true,
              onTtsAction: () => tapped = true,
            ),
          ),
        ),
      );

      expect(find.text(TtsPlaybackMessages.speakButtonLabel), findsOneWidget);
      expect(
        find.bySemanticsLabel(TtsPlaybackMessages.speakSemanticLabel),
        findsOneWidget,
      );

      await tester.tap(find.text(TtsPlaybackMessages.speakButtonLabel));
      expect(tapped, isTrue);
    });

    testWidgets('shows Parar when speaking active message', (tester) async {
      final message = ChatMessage(
        id: 'a1',
        role: MessageRole.assistant,
        content: 'Olá',
        createdAt: DateTime(2026, 8, 6, 12),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatMessageBubble(
              message: message,
              showTtsControls: true,
              isSpeaking: true,
              onTtsAction: () {},
            ),
          ),
        ),
      );

      expect(find.text(TtsPlaybackMessages.stopButtonLabel), findsOneWidget);
      expect(
        find.bySemanticsLabel(TtsPlaybackMessages.stopSemanticLabel),
        findsOneWidget,
      );
    });

    testWidgets('highlights assistant bubble while speaking', (tester) async {
      final message = ChatMessage(
        id: 'a1',
        role: MessageRole.assistant,
        content: 'Olá',
        createdAt: DateTime(2026, 8, 6, 12),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatMessageBubble(
              message: message,
              showTtsControls: true,
              isSpeaking: true,
              onTtsAction: () {},
            ),
          ),
        ),
      );

      expect(find.byKey(const ValueKey('tts-speaking-bubble')), findsOneWidget);
      final animated = tester.widget<AnimatedContainer>(
        find.byKey(const ValueKey('tts-speaking-bubble')),
      );
      final decoration = animated.decoration! as BoxDecoration;
      final border = decoration.border! as Border;
      expect(border.top.width, 2);
      expect(decoration.color, AppColors.primaryLight);
    });

    testWidgets('hides TTS controls for user messages', (tester) async {
      final message = ChatMessage(
        id: 'u1',
        role: MessageRole.user,
        content: 'Oi',
        createdAt: DateTime(2026, 8, 6, 12),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatMessageBubble(
              message: message,
              showTtsControls: true,
              onTtsAction: () {},
            ),
          ),
        ),
      );

      expect(find.text(TtsPlaybackMessages.speakButtonLabel), findsNothing);
    });

    testWidgets('hides TTS when showTtsControls is false', (tester) async {
      final message = ChatMessage(
        id: 'a1',
        role: MessageRole.assistant,
        content: 'Olá',
        createdAt: DateTime(2026, 8, 6, 12),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatMessageBubble(message: message),
          ),
        ),
      );

      expect(find.text(TtsPlaybackMessages.speakButtonLabel), findsNothing);
    });
  });

  group('ChatHeroHeader auto-TTS', () {
    testWidgets('toggle exposes clear semantics when enabled', (tester) async {
      var toggled = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatHeroHeader(
              autoTtsEnabled: true,
              onToggleAutoTts: () => toggled = true,
            ),
          ),
        ),
      );

      expect(
        find.bySemanticsLabel(TtsPlaybackMessages.autoTtsOnSemanticLabel),
        findsOneWidget,
      );

      await tester.tap(
        find.bySemanticsLabel(TtsPlaybackMessages.autoTtsOnSemanticLabel),
      );
      expect(toggled, isTrue);
    });

    testWidgets('toggle semantics reflect off state', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatHeroHeader(
              autoTtsEnabled: false,
              onToggleAutoTts: () {},
            ),
          ),
        ),
      );

      expect(
        find.bySemanticsLabel(TtsPlaybackMessages.autoTtsOffSemanticLabel),
        findsOneWidget,
      );
    });
  });
}
