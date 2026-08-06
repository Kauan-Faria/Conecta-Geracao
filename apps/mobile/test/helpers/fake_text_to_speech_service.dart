import 'package:conecta_geracao/features/chat/data/text_to_speech_service.dart';

class FakeTextToSpeechService implements TextToSpeechService {
  FakeTextToSpeechService({this.failOnInitialize = false, this.failOnSpeak = false});

  bool failOnInitialize;
  bool failOnSpeak;
  bool speaking = false;
  bool disposed = false;
  int speakCount = 0;
  int stopCount = 0;
  int disposeCount = 0;
  int initializeCount = 0;
  String? lastSpokenText;
  String? lastLanguage;
  TtsCompletionCallback? lastOnComplete;
  TtsErrorCallback? lastOnError;

  @override
  Future<void> initialize({
    TtsCompletionCallback? onComplete,
    TtsErrorCallback? onError,
  }) async {
    initializeCount++;
    disposed = false;
    lastOnComplete = onComplete;
    lastOnError = onError;
    if (failOnInitialize) {
      throw StateError('tts_init_failed');
    }
  }

  @override
  Future<void> speak(String text, {String language = 'pt-BR'}) async {
    speakCount++;
    lastSpokenText = text;
    lastLanguage = language;
    if (failOnSpeak) {
      speaking = false;
      throw StateError('tts_speak_failed');
    }
    speaking = true;
  }

  @override
  Future<void> stop() async {
    stopCount++;
    speaking = false;
  }

  @override
  Future<void> dispose() async {
    disposeCount++;
    speaking = false;
    disposed = true;
    lastOnComplete = null;
    lastOnError = null;
  }

  void emitComplete() {
    speaking = false;
    lastOnComplete?.call();
  }

  void emitError([String message = 'tts_error']) {
    speaking = false;
    lastOnError?.call(message);
  }
}
