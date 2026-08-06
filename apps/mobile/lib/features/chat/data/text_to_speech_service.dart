import 'package:flutter_tts/flutter_tts.dart';

typedef TtsCompletionCallback = void Function();
typedef TtsErrorCallback = void Function(String message);

/// Porta de síntese de voz — facilita fakes nos testes.
///
/// Pause/resume do `flutter_tts` não é exposto: no Android o suporte é
/// inconsistente; o fluxo do app usa apenas stop.
abstract class TextToSpeechService {
  Future<void> initialize({
    TtsCompletionCallback? onComplete,
    TtsErrorCallback? onError,
  });

  Future<void> speak(String text, {String language = 'pt-BR'});

  Future<void> stop();

  /// Libera handlers/engine. Pode ser chamado mais de uma vez; um novo
  /// [initialize] reativa a instância.
  Future<void> dispose();
}

class FlutterTextToSpeechService implements TextToSpeechService {
  FlutterTextToSpeechService({FlutterTts? tts}) : _tts = tts ?? FlutterTts();

  final FlutterTts _tts;
  bool _initialized = false;

  @override
  Future<void> initialize({
    TtsCompletionCallback? onComplete,
    TtsErrorCallback? onError,
  }) async {
    _tts.setCompletionHandler(() {
      onComplete?.call();
    });
    _tts.setErrorHandler((dynamic message) {
      onError?.call(message?.toString() ?? 'tts_error');
    });

    if (_initialized) {
      return;
    }

    // Valores pensados para baixa alfabetização digital (fala clara e estável).
    await _tts.setLanguage('pt-BR');
    await _tts.setSpeechRate(0.45);
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);
    _initialized = true;
  }

  @override
  Future<void> speak(String text, {String language = 'pt-BR'}) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty) {
      return;
    }
    await _tts.setLanguage(language);
    await _tts.speak(trimmed);
  }

  @override
  Future<void> stop() => _tts.stop();

  @override
  Future<void> dispose() async {
    try {
      await _tts.stop();
    } catch (_) {
      // Continua limpando handlers mesmo se stop falhar.
    }
    _tts.setCompletionHandler(() {});
    _tts.setErrorHandler((_) {});
    _initialized = false;
  }
}
