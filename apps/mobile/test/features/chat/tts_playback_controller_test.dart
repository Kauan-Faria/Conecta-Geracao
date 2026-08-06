import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/chat/data/auto_tts_prefs_repository.dart';
import 'package:conecta_geracao/features/chat/domain/tts_playback_state.dart';
import 'package:conecta_geracao/features/chat/presentation/tts_playback_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_text_to_speech_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late FakeTextToSpeechService fakeTts;
  late SharedPreferences prefs;
  late ProviderContainer container;

  Future<ProviderContainer> createContainer({
    bool platformSupported = true,
    bool? autoTtsInitial,
  }) async {
    SharedPreferences.setMockInitialValues({});
    prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (autoTtsInitial != null) {
      await prefs.setBool(
        SharedPreferencesAutoTtsPrefsRepository.key,
        autoTtsInitial,
      );
    }
    fakeTts = FakeTextToSpeechService();
    final next = ProviderContainer(
      overrides: [
        textToSpeechServiceProvider.overrideWithValue(fakeTts),
        autoTtsPrefsRepositoryProvider.overrideWithValue(
          SharedPreferencesAutoTtsPrefsRepository(prefs),
        ),
        sharedPreferencesProvider.overrideWithValue(prefs),
        ttsPlatformSupportedProvider.overrideWithValue(platformSupported),
      ],
    );
    // Dispara build + carga da preferência antes dos asserts.
    next.read(ttsPlaybackControllerProvider);
    await next.read(ttsPlaybackControllerProvider.notifier).ensurePrefsLoaded();
    return next;
  }

  tearDown(() {
    container.dispose();
  });

  group('TtsPlaybackController', () {
    test('defaults auto-TTS to enabled when preference missing', () async {
      container = await createContainer();

      expect(container.read(ttsPlaybackControllerProvider).autoTtsEnabled, isTrue);
    });

    test('loads persisted auto-TTS preference', () async {
      container = await createContainer(autoTtsInitial: false);

      expect(
        container.read(ttsPlaybackControllerProvider).autoTtsEnabled,
        isFalse,
      );
    });

    test('onNewAssistantMessage speaks when auto-TTS enabled', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.onNewAssistantMessage(
        messageId: 'a1',
        content: 'Olá, posso ajudar?',
      );

      final state = container.read(ttsPlaybackControllerProvider);
      expect(state.status, TtsPlaybackStatus.speaking);
      expect(state.speakingMessageId, 'a1');
      expect(fakeTts.speakCount, 1);
      expect(fakeTts.lastSpokenText, 'Olá, posso ajudar?');
      expect(fakeTts.lastLanguage, 'pt-BR');
    });

    test('onNewAssistantMessage skips when auto-TTS disabled', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.setAutoTtsEnabled(false);
      await notifier.onNewAssistantMessage(
        messageId: 'a1',
        content: 'Não deve ler',
      );

      expect(fakeTts.speakCount, 0);
      expect(
        container.read(ttsPlaybackControllerProvider).status,
        TtsPlaybackStatus.idle,
      );
    });

    test('toggleForMessage stops when speaking same message', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.speak(messageId: 'a1', content: 'Texto');
      await notifier.toggleForMessage(messageId: 'a1', content: 'Texto');

      expect(
        container.read(ttsPlaybackControllerProvider).status,
        TtsPlaybackStatus.stopped,
      );
      expect(fakeTts.stopCount, greaterThanOrEqualTo(1));
    });

    test('toggleForMessage replays after stop', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.speak(messageId: 'a1', content: 'Texto');
      await notifier.stopSpeaking();
      await notifier.toggleForMessage(messageId: 'a1', content: 'Texto');

      expect(
        container.read(ttsPlaybackControllerProvider).status,
        TtsPlaybackStatus.speaking,
      );
      expect(fakeTts.speakCount, 2);
    });

    test('new speak cancels previous playback', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.speak(messageId: 'a1', content: 'Primeira');
      await notifier.speak(messageId: 'a2', content: 'Segunda');

      final state = container.read(ttsPlaybackControllerProvider);
      expect(state.speakingMessageId, 'a2');
      expect(fakeTts.lastSpokenText, 'Segunda');
      expect(fakeTts.stopCount, greaterThanOrEqualTo(1));
    });

    test('stopIfSpeaking stops current playback', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.speak(messageId: 'a1', content: 'Texto');
      await notifier.stopIfSpeaking();

      expect(
        container.read(ttsPlaybackControllerProvider).status,
        TtsPlaybackStatus.stopped,
      );
    });

    test('disposePlayback stops engine and clears handlers', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.speak(messageId: 'a1', content: 'Texto');
      await notifier.disposePlayback();

      expect(
        container.read(ttsPlaybackControllerProvider).status,
        TtsPlaybackStatus.idle,
      );
      expect(container.read(ttsPlaybackControllerProvider).speakingMessageId, isNull);
      expect(fakeTts.disposeCount, 1);
      expect(fakeTts.disposed, isTrue);

      // Completion após dispose não deve alterar estado.
      fakeTts.emitComplete();
      expect(
        container.read(ttsPlaybackControllerProvider).status,
        TtsPlaybackStatus.idle,
      );

      // Novo speak re-inicializa.
      await notifier.speak(messageId: 'a2', content: 'De novo');
      expect(
        container.read(ttsPlaybackControllerProvider).status,
        TtsPlaybackStatus.speaking,
      );
      expect(fakeTts.initializeCount, greaterThanOrEqualTo(2));
    });

    test('disabling auto-TTS during speech stops playback', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.speak(messageId: 'a1', content: 'Texto');
      await notifier.setAutoTtsEnabled(false);

      expect(
        container.read(ttsPlaybackControllerProvider).status,
        TtsPlaybackStatus.stopped,
      );
      expect(prefs.getBool(SharedPreferencesAutoTtsPrefsRepository.key), isFalse);
    });

    test('speak failure keeps chat usable with friendly feedback', () async {
      container = await createContainer();
      fakeTts.failOnSpeak = true;
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.speak(messageId: 'a1', content: 'Texto');

      final state = container.read(ttsPlaybackControllerProvider);
      expect(state.status, TtsPlaybackStatus.error);
      expect(state.feedbackMessage, TtsPlaybackMessages.genericError);
      expect(state.speakingMessageId, isNull);
    });

    test('non-Android shows android-only message and does not speak', () async {
      container = await createContainer(platformSupported: false);
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.speak(messageId: 'a1', content: 'Texto');

      final state = container.read(ttsPlaybackControllerProvider);
      expect(state.status, TtsPlaybackStatus.error);
      expect(state.feedbackMessage, TtsPlaybackMessages.androidOnlySoon);
      expect(fakeTts.speakCount, 0);
    });

    test('completion handler returns to idle', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.speak(messageId: 'a1', content: 'Texto');
      fakeTts.emitComplete();

      expect(
        container.read(ttsPlaybackControllerProvider).status,
        TtsPlaybackStatus.idle,
      );
    });

    test('stale completion after stop keeps stopped status', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.speak(messageId: 'a1', content: 'Texto');
      await notifier.stopSpeaking();
      fakeTts.emitComplete();

      expect(
        container.read(ttsPlaybackControllerProvider).status,
        TtsPlaybackStatus.stopped,
      );
    });

    test('speak surfaces loading before speaking with sync engine', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      final future = notifier.speak(messageId: 'a1', content: 'Texto');
      // Com fake síncrono o loading é transitório; ao fim deve estar speaking.
      await future;

      final state = container.read(ttsPlaybackControllerProvider);
      expect(state.status, TtsPlaybackStatus.speaking);
      expect(
        TtsPlaybackStatus.values,
        containsAll([
          TtsPlaybackStatus.idle,
          TtsPlaybackStatus.loading,
          TtsPlaybackStatus.speaking,
          TtsPlaybackStatus.stopped,
          TtsPlaybackStatus.error,
        ]),
      );
    });

    test('speak sanitizes markdown before sending to TTS', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.speak(
        messageId: 'a1',
        content: '**Olá** veja https://exemplo.com/longo',
      );

      expect(fakeTts.speakCount, 1);
      expect(fakeTts.lastSpokenText, 'Olá veja');
      expect(fakeTts.lastSpokenText!.contains('http'), isFalse);
    });

    test('speak skips non-speakable JSON without error state', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.speak(
        messageId: 'a1',
        content: '{"status":"error","code":500}',
      );

      expect(fakeTts.speakCount, 0);
      final state = container.read(ttsPlaybackControllerProvider);
      expect(state.status, TtsPlaybackStatus.idle);
      expect(state.feedbackMessage, isNull);
    });

    test('onNewAssistantMessage speaks only once per messageId', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.onNewAssistantMessage(
        messageId: 'a1',
        content: 'Primeira leitura',
      );
      await notifier.stopSpeaking();
      await notifier.onNewAssistantMessage(
        messageId: 'a1',
        content: 'Primeira leitura',
      );

      expect(fakeTts.speakCount, 1);
    });

    test('onNewAssistantMessage skips when isFinal is false', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.onNewAssistantMessage(
        messageId: 'a1',
        content: 'Ainda carregando...',
        isFinal: false,
      );

      expect(fakeTts.speakCount, 0);
      expect(
        container.read(ttsPlaybackControllerProvider).status,
        TtsPlaybackStatus.idle,
      );
    });

    test('manual toggle can replay after auto-TTS for same messageId', () async {
      container = await createContainer();
      final notifier = container.read(ttsPlaybackControllerProvider.notifier);

      await notifier.onNewAssistantMessage(
        messageId: 'a1',
        content: 'Resposta útil',
      );
      await notifier.stopSpeaking();
      await notifier.toggleForMessage(
        messageId: 'a1',
        content: 'Resposta útil',
      );

      expect(fakeTts.speakCount, 2);
    });
  });

  group('tts labels', () {
    test('speak and stop semantics differ', () {
      expect(
        ttsActionSemanticLabel(TtsPlaybackStatus.idle, isActiveMessage: false),
        TtsPlaybackMessages.speakSemanticLabel,
      );
      expect(
        ttsActionSemanticLabel(
          TtsPlaybackStatus.speaking,
          isActiveMessage: true,
        ),
        TtsPlaybackMessages.stopSemanticLabel,
      );
      expect(
        ttsActionSemanticLabel(
          TtsPlaybackStatus.stopped,
          isActiveMessage: false,
        ),
        TtsPlaybackMessages.speakSemanticLabel,
      );
      expect(
        ttsActionSemanticLabel(
          TtsPlaybackStatus.loading,
          isActiveMessage: true,
        ),
        TtsPlaybackMessages.speakSemanticLabel,
      );
      expect(autoTtsSemanticLabel(true), TtsPlaybackMessages.autoTtsOnSemanticLabel);
      expect(
        autoTtsSemanticLabel(false),
        TtsPlaybackMessages.autoTtsOffSemanticLabel,
      );
      expect(
        TtsPlaybackMessages.autoTtsOnSemanticLabel,
        contains('Ler respostas em voz alta'),
      );
    });
  });
}
