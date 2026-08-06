import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/chat/data/auto_tts_prefs_repository.dart';
import 'package:conecta_geracao/features/chat/domain/voice_listening_state.dart';
import 'package:conecta_geracao/features/chat/presentation/tts_playback_controller.dart';
import 'package:conecta_geracao/features/chat/presentation/voice_input_controller.dart';
import 'package:conecta_geracao/features/chat/presentation/widgets/chat_input_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_speech_recognition_service.dart';
import '../../helpers/fake_text_to_speech_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late FakeSpeechRecognitionService fakeSpeech;
  late FakeTextToSpeechService fakeTts;
  late SharedPreferences prefs;
  late TextEditingController textController;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    prefs = await SharedPreferences.getInstance();
    fakeSpeech = FakeSpeechRecognitionService();
    fakeTts = FakeTextToSpeechService();
    textController = TextEditingController();
  });

  tearDown(() {
    textController.dispose();
  });

  List<Override> voiceOverrides({bool voicePlatformSupported = true}) => [
        speechRecognitionServiceProvider.overrideWithValue(fakeSpeech),
        voiceInputPlatformSupportedProvider.overrideWithValue(
          voicePlatformSupported,
        ),
        textToSpeechServiceProvider.overrideWithValue(fakeTts),
        autoTtsPrefsRepositoryProvider.overrideWithValue(
          SharedPreferencesAutoTtsPrefsRepository(prefs),
        ),
        sharedPreferencesProvider.overrideWithValue(prefs),
        ttsPlatformSupportedProvider.overrideWithValue(true),
      ];

  testWidgets('idle shows Gravar and accessible record semantics', (
    tester,
  ) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: voiceOverrides(),
        child: MaterialApp(
          home: Scaffold(
            body: ChatInputBar(
              controller: textController,
              isSending: false,
              onSend: () {},
            ),
          ),
        ),
      ),
    );

    expect(find.text('Gravar'), findsOneWidget);
    expect(find.byIcon(Icons.mic), findsOneWidget);
    expect(
      tester.getSize(find.byType(FilledButton)).height,
      greaterThanOrEqualTo(AppSpacing.minTouchTarget),
    );

    expect(
      find.bySemanticsLabel(VoiceInputMessages.recordSemanticLabel),
      findsOneWidget,
    );
  });

  testWidgets('tap starts listening and shows Parar without sending', (
    tester,
  ) async {
    var sendCount = 0;
    await tester.pumpWidget(
      ProviderScope(
        overrides: voiceOverrides(),
        child: MaterialApp(
          home: Scaffold(
            body: ChatInputBar(
              controller: textController,
              isSending: false,
              onSend: () => sendCount++,
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Gravar'));
    await tester.pump();

    expect(find.text('Parar'), findsOneWidget);
    expect(find.byIcon(Icons.stop), findsOneWidget);
    expect(
      find.bySemanticsLabel(VoiceInputMessages.stopSemanticLabel),
      findsOneWidget,
    );
    expect(sendCount, 0);
    expect(fakeSpeech.startCount, 1);

    fakeSpeech.emitPartial('olá assistente');
    await tester.pump();

    expect(textController.text, 'olá assistente');
    expect(sendCount, 0);
  });

  testWidgets('second tap stops and keeps text in field', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: voiceOverrides(),
        child: MaterialApp(
          home: Scaffold(
            body: ChatInputBar(
              controller: textController,
              isSending: false,
              onSend: () {},
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Gravar'));
    await tester.pump();
    fakeSpeech.emitPartial('pix');
    await tester.pump();

    await tester.tap(find.text('Parar'));
    await tester.pump();

    expect(find.text('Gravar'), findsOneWidget);
    expect(textController.text, 'pix');
    expect(fakeSpeech.stopCount, 1);
  });

  testWidgets('non-Android tap shows soon message and does not listen', (
    tester,
  ) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: voiceOverrides(voicePlatformSupported: false),
        child: MaterialApp(
          home: Scaffold(
            body: ChatInputBar(
              controller: textController,
              isSending: false,
              onSend: () {},
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Gravar'));
    await tester.pump();

    expect(find.text(VoiceInputMessages.androidOnlySoon), findsOneWidget);
    expect(fakeSpeech.startCount, 0);
    expect(find.text('Gravar'), findsOneWidget);
  });

  testWidgets('voice button disabled while sending', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: voiceOverrides(),
        child: MaterialApp(
          home: Scaffold(
            body: ChatInputBar(
              controller: textController,
              isSending: true,
              onSend: () {},
            ),
          ),
        ),
      ),
    );

    final button = tester.widget<FilledButton>(find.byType(FilledButton));
    expect(button.onPressed, isNull);
  });
}
