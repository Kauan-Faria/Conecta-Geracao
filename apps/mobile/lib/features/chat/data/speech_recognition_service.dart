import 'package:speech_to_text/speech_recognition_error.dart';
import 'package:speech_to_text/speech_recognition_result.dart';
import 'package:speech_to_text/speech_to_text.dart';

typedef SpeechTranscriptCallback =
    void Function(String words, {required bool isFinal});

typedef SpeechErrorCallback = void Function(String errorCode);

/// Porta de reconhecimento de fala — facilita fakes nos testes.
abstract class SpeechRecognitionService {
  Future<bool> get hasPermission;

  bool get isListening;

  Future<bool> initialize({
    SpeechErrorCallback? onError,
    void Function(String status)? onStatus,
  });

  Future<void> startListening({
    required SpeechTranscriptCallback onResult,
    String localeId = 'pt_BR',
  });

  Future<void> stop();

  Future<void> cancel();
}

class SpeechToTextRecognitionService implements SpeechRecognitionService {
  SpeechToTextRecognitionService({SpeechToText? speech})
    : _speech = speech ?? SpeechToText();

  final SpeechToText _speech;

  SpeechErrorCallback? _onError;
  void Function(String status)? _onStatus;

  @override
  Future<bool> get hasPermission => _speech.hasPermission;

  @override
  bool get isListening => _speech.isListening;

  @override
  Future<bool> initialize({
    SpeechErrorCallback? onError,
    void Function(String status)? onStatus,
  }) async {
    _onError = onError;
    _onStatus = onStatus;
    return _speech.initialize(
      onError: _handleError,
      onStatus: _onStatus,
      options: [SpeechToText.androidNoBluetooth],
    );
  }

  void _handleError(SpeechRecognitionError error) {
    _onError?.call(error.errorMsg);
  }

  @override
  Future<void> startListening({
    required SpeechTranscriptCallback onResult,
    String localeId = 'pt_BR',
  }) async {
    await _speech.listen(
      onResult: (SpeechRecognitionResult result) {
        onResult(result.recognizedWords, isFinal: result.finalResult);
      },
      listenOptions: SpeechListenOptions(
        partialResults: true,
        listenMode: ListenMode.dictation,
        cancelOnError: true,
        localeId: localeId,
      ),
    );
  }

  @override
  Future<void> stop() => _speech.stop();

  @override
  Future<void> cancel() => _speech.cancel();
}
