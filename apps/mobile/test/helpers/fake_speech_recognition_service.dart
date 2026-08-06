import 'package:conecta_geracao/features/chat/data/speech_recognition_service.dart';

class FakeSpeechRecognitionService implements SpeechRecognitionService {
  FakeSpeechRecognitionService({
    this.initializeResult = true,
    this.hasPermissionResult = true,
  });

  bool initializeResult;
  bool hasPermissionResult;
  bool listening = false;
  SpeechTranscriptCallback? lastOnResult;
  SpeechErrorCallback? lastOnError;
  void Function(String status)? lastOnStatus;
  int startCount = 0;
  int stopCount = 0;

  @override
  Future<bool> get hasPermission async => hasPermissionResult;

  @override
  bool get isListening => listening;

  @override
  Future<bool> initialize({
    SpeechErrorCallback? onError,
    void Function(String status)? onStatus,
  }) async {
    lastOnError = onError;
    lastOnStatus = onStatus;
    return initializeResult;
  }

  @override
  Future<void> startListening({
    required SpeechTranscriptCallback onResult,
    String localeId = 'pt_BR',
  }) async {
    startCount++;
    lastOnResult = onResult;
    listening = true;
  }

  @override
  Future<void> stop() async {
    stopCount++;
    listening = false;
  }

  @override
  Future<void> cancel() async {
    listening = false;
  }

  void emitPartial(String words) {
    lastOnResult?.call(words, isFinal: false);
  }

  void emitFinal(String words) {
    lastOnResult?.call(words, isFinal: true);
  }
}
