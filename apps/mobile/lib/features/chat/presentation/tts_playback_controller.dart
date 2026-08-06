import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/chat/data/auto_tts_prefs_repository.dart';
import 'package:conecta_geracao/features/chat/data/text_to_speech_service.dart';
import 'package:conecta_geracao/features/chat/domain/tts_playback_state.dart';
import 'package:conecta_geracao/features/chat/domain/tts_speakable_text.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final textToSpeechServiceProvider = Provider<TextToSpeechService>((ref) {
  return FlutterTextToSpeechService();
});

final autoTtsPrefsRepositoryProvider = Provider<AutoTtsPrefsRepository>((ref) {
  return SharedPreferencesAutoTtsPrefsRepository(
    ref.watch(sharedPreferencesProvider),
  );
});

/// Android é o alvo deste intent; demais plataformas degradam sem crash.
final ttsPlatformSupportedProvider = Provider<bool>((ref) {
  return !kIsWeb && defaultTargetPlatform == TargetPlatform.android;
});

class TtsPlaybackState {
  const TtsPlaybackState({
    this.status = TtsPlaybackStatus.idle,
    this.speakingMessageId,
    this.lastSpokenText = '',
    this.autoTtsEnabled = true,
    this.feedbackMessage,
    this.isPlatformSupported = true,
  });

  final TtsPlaybackStatus status;
  final String? speakingMessageId;
  final String lastSpokenText;
  final bool autoTtsEnabled;
  final String? feedbackMessage;
  final bool isPlatformSupported;

  bool get isSpeaking => status == TtsPlaybackStatus.speaking;

  bool get isBusy =>
      status == TtsPlaybackStatus.loading || status == TtsPlaybackStatus.speaking;

  bool isSpeakingMessage(String messageId) =>
      isSpeaking && speakingMessageId == messageId;

  TtsPlaybackState copyWith({
    TtsPlaybackStatus? status,
    String? speakingMessageId,
    String? lastSpokenText,
    bool? autoTtsEnabled,
    String? feedbackMessage,
    bool clearFeedback = false,
    bool clearSpeakingMessageId = false,
    bool? isPlatformSupported,
  }) {
    return TtsPlaybackState(
      status: status ?? this.status,
      speakingMessageId: clearSpeakingMessageId
          ? null
          : (speakingMessageId ?? this.speakingMessageId),
      lastSpokenText: lastSpokenText ?? this.lastSpokenText,
      autoTtsEnabled: autoTtsEnabled ?? this.autoTtsEnabled,
      feedbackMessage: clearFeedback
          ? null
          : (feedbackMessage ?? this.feedbackMessage),
      isPlatformSupported: isPlatformSupported ?? this.isPlatformSupported,
    );
  }
}

class TtsPlaybackController extends Notifier<TtsPlaybackState> {
  bool _initialized = false;
  int _speakGeneration = 0;
  Future<void>? _prefsLoadFuture;
  bool _autoTtsUserOverride = false;
  final Set<String> _autoSpokenMessageIds = <String>{};

  TextToSpeechService get _tts => ref.read(textToSpeechServiceProvider);

  AutoTtsPrefsRepository get _prefs =>
      ref.read(autoTtsPrefsRepositoryProvider);

  @override
  TtsPlaybackState build() {
    final supported = ref.watch(ttsPlatformSupportedProvider);
    _autoTtsUserOverride = false;
    _autoSpokenMessageIds.clear();
    _prefsLoadFuture = _loadAutoTtsPreference();
    return TtsPlaybackState(isPlatformSupported: supported);
  }

  /// Aguarda a preferência inicial (útil em testes e antes de auto-speak).
  Future<void> ensurePrefsLoaded() async {
    await _prefsLoadFuture;
  }

  Future<void> _loadAutoTtsPreference() async {
    final enabled = await _prefs.load(defaultValue: true);
    // Não sobrescreve se o usuário já alterou o toggle nesta sessão.
    if (_autoTtsUserOverride) {
      return;
    }
    state = state.copyWith(autoTtsEnabled: enabled);
  }

  /// Dispara leitura automática de uma nova resposta do assistente.
  ///
  /// Uma vez por [messageId] (rebuilds não duplicam). Conteúdo parcial/
  /// não speakable é ignorado silenciosamente.
  Future<void> onNewAssistantMessage({
    required String messageId,
    required String content,
    bool isFinal = true,
  }) async {
    await ensurePrefsLoaded();
    if (!state.autoTtsEnabled) {
      return;
    }
    if (!isFinal) {
      return;
    }
    if (_autoSpokenMessageIds.contains(messageId)) {
      return;
    }

    final speakable = sanitizeForTts(content);
    if (!speakable.isSpeakable) {
      // Marca como processada para não tentar de novo no mesmo id.
      _autoSpokenMessageIds.add(messageId);
      return;
    }

    _autoSpokenMessageIds.add(messageId);
    await speak(
      messageId: messageId,
      content: speakable.text,
      alreadySanitized: true,
    );
  }

  /// Lê ou para a mensagem tocada (ouvir / parar / ouvir novamente).
  Future<void> toggleForMessage({
    required String messageId,
    required String content,
  }) async {
    if (state.isSpeakingMessage(messageId)) {
      await stopSpeaking();
      return;
    }
    await speak(messageId: messageId, content: content);
  }

  Future<void> speak({
    required String messageId,
    required String content,
    bool alreadySanitized = false,
  }) async {
    if (!state.isPlatformSupported) {
      state = state.copyWith(
        status: TtsPlaybackStatus.error,
        feedbackMessage: TtsPlaybackMessages.androidOnlySoon,
      );
      return;
    }

    final speakable =
        alreadySanitized
            ? SpeakableText.speakable(content.trim())
            : sanitizeForTts(content);
    if (!speakable.isSpeakable || speakable.text.isEmpty) {
      return;
    }

    final trimmed = speakable.text;

    state = state.copyWith(
      status: TtsPlaybackStatus.loading,
      speakingMessageId: messageId,
      clearFeedback: true,
    );

    final ready = await _ensureInitialized();
    if (!ready) {
      return;
    }

    // Cancela leitura anterior antes de iniciar nova (respostas rápidas).
    if (state.isBusy || state.speakingMessageId != null) {
      try {
        await _tts.stop();
      } catch (_) {
        // Continua tentando a nova leitura.
      }
    }

    final generation = ++_speakGeneration;
    state = state.copyWith(
      status: TtsPlaybackStatus.speaking,
      speakingMessageId: messageId,
      lastSpokenText: trimmed,
      clearFeedback: true,
    );

    try {
      await _tts.speak(trimmed, language: 'pt-BR');
      if (generation != _speakGeneration) {
        return;
      }
    } catch (_) {
      if (generation != _speakGeneration) {
        return;
      }
      state = state.copyWith(
        status: TtsPlaybackStatus.error,
        clearSpeakingMessageId: true,
        feedbackMessage: TtsPlaybackMessages.genericError,
      );
    }
  }

  Future<void> stopSpeaking() async {
    _speakGeneration++;
    try {
      await _tts.stop();
    } catch (_) {
      // Garante retorno ao estado parado mesmo se o plugin falhar ao parar.
    }
    state = state.copyWith(
      status: TtsPlaybackStatus.stopped,
      clearSpeakingMessageId: true,
      clearFeedback: true,
    );
  }

  /// Usado ao enviar mensagem ou iniciar STT: interrompe TTS em curso.
  Future<void> stopIfSpeaking() async {
    if (state.isBusy) {
      await stopSpeaking();
    }
  }

  /// Para a leitura e libera o engine (sair da tela / dispose da página).
  ///
  /// Seguro chamar mais de uma vez; um novo [speak] re-inicializa.
  Future<void> disposePlayback() async {
    _speakGeneration++;
    try {
      await _tts.stop();
    } catch (_) {
      // Continua dispose mesmo se stop falhar.
    }
    try {
      await _tts.dispose();
    } catch (_) {
      // Engine já liberado ou indisponível.
    }
    _initialized = false;
    state = state.copyWith(
      status: TtsPlaybackStatus.idle,
      clearSpeakingMessageId: true,
      clearFeedback: true,
    );
  }

  Future<void> setAutoTtsEnabled(bool enabled) async {
    await ensurePrefsLoaded();
    _autoTtsUserOverride = true;
    state = state.copyWith(autoTtsEnabled: enabled);
    await _prefs.save(enabled);
    if (!enabled && state.isBusy) {
      await stopSpeaking();
    }
  }

  Future<void> toggleAutoTts() async {
    await setAutoTtsEnabled(!state.autoTtsEnabled);
  }

  void clearFeedback() {
    if (state.feedbackMessage != null) {
      state = state.copyWith(clearFeedback: true);
    }
  }

  Future<bool> _ensureInitialized() async {
    if (_initialized) {
      return true;
    }

    try {
      await _tts.initialize(
        onComplete: _onComplete,
        onError: _onError,
      );
      _initialized = true;
      return true;
    } catch (_) {
      state = state.copyWith(
        status: TtsPlaybackStatus.error,
        clearSpeakingMessageId: true,
        feedbackMessage: TtsPlaybackMessages.genericError,
      );
      return false;
    }
  }

  void _onComplete() {
    // Ignora completion de gerações canceladas (stop / nova fala / dispose).
    if (state.status != TtsPlaybackStatus.speaking) {
      return;
    }
    state = state.copyWith(
      status: TtsPlaybackStatus.idle,
      clearSpeakingMessageId: true,
      clearFeedback: true,
    );
  }

  void _onError(String message) {
    if (state.status != TtsPlaybackStatus.speaking &&
        state.status != TtsPlaybackStatus.loading) {
      return;
    }
    state = state.copyWith(
      status: TtsPlaybackStatus.error,
      clearSpeakingMessageId: true,
      feedbackMessage: TtsPlaybackMessages.genericError,
    );
  }
}

final ttsPlaybackControllerProvider =
    NotifierProvider<TtsPlaybackController, TtsPlaybackState>(
      TtsPlaybackController.new,
    );
