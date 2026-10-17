import 'package:conecta_geracao/features/chat/presentation/tts_playback_controller.dart';
import 'package:conecta_geracao/features/chat/presentation/voice_input_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'fake_speech_recognition_service.dart';
import 'fake_text_to_speech_service.dart';

/// Overrides obrigatórios para qualquer widget test que monte o
/// `ConectaGeracaoApp` (ou o `ChatPage` diretamente).
///
/// Em `flutter test`, `defaultTargetPlatform` é sempre Android, então o
/// auto-TTS fica ativo e o ChatPage chama `flutter_tts`/`speech_to_text`
/// de verdade. Sem mock, essas chamadas vão para um MethodChannel sem
/// handler e, dentro do FakeAsync do `testWidgets`, o Future nunca resolve.
/// Qualquer `await` do teste que passe por elas (ex.: `onSim()` →
/// `stopIfSpeaking()` → `FlutterTts.stop()`) trava até o timeout global.
List<Override> voiceTestOverrides({
  FakeTextToSpeechService? tts,
  FakeSpeechRecognitionService? speech,
}) {
  return [
    textToSpeechServiceProvider.overrideWithValue(
      tts ?? FakeTextToSpeechService(),
    ),
    speechRecognitionServiceProvider.overrideWithValue(
      speech ?? FakeSpeechRecognitionService(),
    ),
  ];
}
