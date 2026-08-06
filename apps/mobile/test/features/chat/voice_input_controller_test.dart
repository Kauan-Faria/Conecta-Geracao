import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/chat/data/auto_tts_prefs_repository.dart';
import 'package:conecta_geracao/features/chat/domain/tts_playback_state.dart';
import 'package:conecta_geracao/features/chat/domain/voice_listening_state.dart';
import 'package:conecta_geracao/features/chat/presentation/tts_playback_controller.dart';
import 'package:conecta_geracao/features/chat/presentation/voice_input_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_speech_recognition_service.dart';
import '../../helpers/fake_text_to_speech_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late FakeSpeechRecognitionService fakeSpeech;
  late FakeTextToSpeechService fakeTts;
  late ProviderContainer container;

  Future<ProviderContainer> createContainer({
    bool platformSupported = true,
  }) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    fakeSpeech = FakeSpeechRecognitionService();
    fakeTts = FakeTextToSpeechService();
    return ProviderContainer(
      overrides: [
        speechRecognitionServiceProvider.overrideWithValue(fakeSpeech),
        voiceInputPlatformSupportedProvider.overrideWithValue(
          platformSupported,
        ),
        textToSpeechServiceProvider.overrideWithValue(fakeTts),
        autoTtsPrefsRepositoryProvider.overrideWithValue(
          SharedPreferencesAutoTtsPrefsRepository(prefs),
        ),
        sharedPreferencesProvider.overrideWithValue(prefs),
        ttsPlatformSupportedProvider.overrideWithValue(true),
      ],
    );
  }

  tearDown(() {
    container.dispose();
  });

  group('VoiceInputController', () {
    test('toggle starts listening on supported platform', () async {
      container = await createContainer();
      final notifier = container.read(voiceInputControllerProvider.notifier);

      await notifier.toggle(currentFieldText: '');

      expect(
        container.read(voiceInputControllerProvider).status,
        VoiceListeningStatus.listening,
      );
      expect(fakeSpeech.startCount, 1);
      expect(fakeSpeech.listening, isTrue);
    });

    test('startListening stops TTS if speaking', () async {
      container = await createContainer();
      final tts = container.read(ttsPlaybackControllerProvider.notifier);
      await tts.ensurePrefsLoaded();
      await tts.speak(messageId: 'a1', content: 'Resposta longa');
      expect(container.read(ttsPlaybackControllerProvider).isSpeaking, isTrue);

      final voice = container.read(voiceInputControllerProvider.notifier);
      await voice.startListening(currentFieldText: '');

      expect(
        container.read(ttsPlaybackControllerProvider).status,
        TtsPlaybackStatus.stopped,
      );
      expect(fakeTts.stopCount, greaterThanOrEqualTo(1));
      expect(
        container.read(voiceInputControllerProvider).status,
        VoiceListeningStatus.listening,
      );
    });

    test('partial results update transcript without leaving listening', () async {
      container = await createContainer();
      final notifier = container.read(voiceInputControllerProvider.notifier);

      await notifier.startListening(currentFieldText: '');
      fakeSpeech.emitPartial('olá');

      final state = container.read(voiceInputControllerProvider);
      expect(state.status, VoiceListeningStatus.listening);
      expect(state.transcript, 'olá');
      expect(state.fieldText, 'olá');
    });

    test('stopListening applies final text and returns to idle', () async {
      container = await createContainer();
      final notifier = container.read(voiceInputControllerProvider.notifier);

      await notifier.startListening(currentFieldText: 'Antes');
      fakeSpeech.emitPartial('mundo');
      await notifier.stopListening();

      final state = container.read(voiceInputControllerProvider);
      expect(state.status, VoiceListeningStatus.idle);
      expect(state.fieldText, 'Antes mundo');
      expect(fakeSpeech.stopCount, 1);
      expect(state.feedbackMessage, isNull);
    });

    test('stop without words shows friendly no-match feedback', () async {
      container = await createContainer();
      final notifier = container.read(voiceInputControllerProvider.notifier);

      await notifier.startListening(currentFieldText: '');
      await notifier.stopListening();

      expect(
        container.read(voiceInputControllerProvider).feedbackMessage,
        VoiceInputMessages.noMatch,
      );
    });

    test('unavailable when initialize fails with permission', () async {
      container = await createContainer();
      fakeSpeech.initializeResult = false;
      fakeSpeech.hasPermissionResult = false;
      final notifier = container.read(voiceInputControllerProvider.notifier);

      await notifier.startListening(currentFieldText: '');

      final state = container.read(voiceInputControllerProvider);
      expect(state.status, VoiceListeningStatus.error);
      expect(
        state.feedbackMessage,
        VoiceInputMessages.permissionPermanentlyDenied,
      );
      expect(fakeSpeech.startCount, 0);
    });

    test('unavailable when STT init fails but permission granted', () async {
      container = await createContainer();
      fakeSpeech.initializeResult = false;
      fakeSpeech.hasPermissionResult = true;
      final notifier = container.read(voiceInputControllerProvider.notifier);

      await notifier.startListening(currentFieldText: '');

      final state = container.read(voiceInputControllerProvider);
      expect(state.status, VoiceListeningStatus.unavailable);
      expect(state.feedbackMessage, VoiceInputMessages.unavailable);
    });

    test('non-Android shows android-only message and does not start', () async {
      container = await createContainer(platformSupported: false);
      final notifier = container.read(voiceInputControllerProvider.notifier);

      await notifier.toggle(currentFieldText: '');

      final state = container.read(voiceInputControllerProvider);
      expect(state.status, VoiceListeningStatus.unavailable);
      expect(state.feedbackMessage, VoiceInputMessages.androidOnlySoon);
      expect(fakeSpeech.startCount, 0);
    });

    test('permission error maps to friendly message', () async {
      container = await createContainer();
      final notifier = container.read(voiceInputControllerProvider.notifier);

      await notifier.startListening(currentFieldText: '');
      fakeSpeech.lastOnError?.call('error_permission');

      expect(
        container.read(voiceInputControllerProvider).feedbackMessage,
        VoiceInputMessages.permissionDenied,
      );
    });
  });

  group('voice labels', () {
    test('idle and listening semantics differ', () {
      expect(
        voiceButtonSemanticLabel(VoiceListeningStatus.idle),
        VoiceInputMessages.recordSemanticLabel,
      );
      expect(
        voiceButtonSemanticLabel(VoiceListeningStatus.listening),
        VoiceInputMessages.stopSemanticLabel,
      );
      expect(
        voiceButtonLabel(VoiceListeningStatus.listening),
        VoiceInputMessages.stopButtonLabel,
      );
    });
  });
}
