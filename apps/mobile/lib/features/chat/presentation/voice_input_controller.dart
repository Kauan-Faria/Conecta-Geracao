import 'package:conecta_geracao/features/chat/data/speech_recognition_service.dart';
import 'package:conecta_geracao/features/chat/domain/voice_listening_state.dart';
import 'package:conecta_geracao/features/chat/presentation/tts_playback_controller.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final speechRecognitionServiceProvider = Provider<SpeechRecognitionService>((
  ref,
) {
  return SpeechToTextRecognitionService();
});

/// Android é o alvo deste intent; demais plataformas degradam sem crash.
final voiceInputPlatformSupportedProvider = Provider<bool>((ref) {
  return !kIsWeb && defaultTargetPlatform == TargetPlatform.android;
});

class VoiceInputState {
  const VoiceInputState({
    this.status = VoiceListeningStatus.idle,
    this.transcript = '',
    this.sessionPrefix = '',
    this.feedbackMessage,
    this.isPlatformSupported = true,
  });

  final VoiceListeningStatus status;
  final String transcript;
  final String sessionPrefix;
  final String? feedbackMessage;
  final bool isPlatformSupported;

  bool get isListening => status == VoiceListeningStatus.listening;

  /// Texto a aplicar no campo (prefixo digitado + reconhecimento da sessão).
  String get fieldText {
    final recognized = transcript.trim();
    final prefix = sessionPrefix.trim();
    if (prefix.isEmpty) {
      return recognized;
    }
    if (recognized.isEmpty) {
      return prefix;
    }
    return '$prefix $recognized';
  }

  VoiceInputState copyWith({
    VoiceListeningStatus? status,
    String? transcript,
    String? sessionPrefix,
    String? feedbackMessage,
    bool clearFeedback = false,
    bool? isPlatformSupported,
  }) {
    return VoiceInputState(
      status: status ?? this.status,
      transcript: transcript ?? this.transcript,
      sessionPrefix: sessionPrefix ?? this.sessionPrefix,
      feedbackMessage: clearFeedback
          ? null
          : (feedbackMessage ?? this.feedbackMessage),
      isPlatformSupported: isPlatformSupported ?? this.isPlatformSupported,
    );
  }
}

class VoiceInputController extends Notifier<VoiceInputState> {
  bool _initialized = false;

  SpeechRecognitionService get _speech =>
      ref.read(speechRecognitionServiceProvider);

  @override
  VoiceInputState build() {
    return VoiceInputState(
      isPlatformSupported: ref.watch(voiceInputPlatformSupportedProvider),
    );
  }

  Future<void> toggle({required String currentFieldText}) async {
    if (!state.isPlatformSupported) {
      state = state.copyWith(
        status: VoiceListeningStatus.unavailable,
        feedbackMessage: VoiceInputMessages.androidOnlySoon,
      );
      return;
    }

    if (state.isListening) {
      await stopListening();
      return;
    }

    await startListening(currentFieldText: currentFieldText);
  }

  Future<void> startListening({required String currentFieldText}) async {
    if (!state.isPlatformSupported || state.isListening) {
      return;
    }

    // Evita TTS falando por cima do microfone.
    await ref.read(ttsPlaybackControllerProvider.notifier).stopIfSpeaking();

    state = state.copyWith(clearFeedback: true);

    final ready = await _ensureInitialized();
    if (!ready) {
      return;
    }

    state = state.copyWith(
      status: VoiceListeningStatus.listening,
      transcript: '',
      sessionPrefix: currentFieldText,
      clearFeedback: true,
    );

    try {
      await _speech.startListening(
        onResult: (words, {required isFinal}) {
          state = state.copyWith(transcript: words);
          if (isFinal && !state.isListening) {
            // Sessão já encerrada pelo usuário/stop; mantém texto.
          }
        },
        localeId: 'pt_BR',
      );
    } catch (_) {
      state = state.copyWith(
        status: VoiceListeningStatus.error,
        feedbackMessage: VoiceInputMessages.genericError,
      );
    }
  }

  Future<void> stopListening() async {
    if (!state.isListening && !_speech.isListening) {
      return;
    }

    try {
      await _speech.stop();
    } catch (_) {
      // Garante retorno ao idle mesmo se o plugin falhar ao parar.
    }

    final hadWords = state.transcript.trim().isNotEmpty;
    state = state.copyWith(
      status: VoiceListeningStatus.idle,
      feedbackMessage: hadWords ? null : VoiceInputMessages.noMatch,
      clearFeedback: hadWords,
    );
  }

  /// Usado ao enviar mensagem enquanto ainda está ouvindo.
  Future<void> stopIfListening() async {
    if (state.isListening || _speech.isListening) {
      await stopListening();
    }
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
      final available = await _speech.initialize(
        onError: _onSpeechError,
        onStatus: _onSpeechStatus,
      );

      if (!available) {
        final permitted = await _speech.hasPermission;
        state = state.copyWith(
          status: permitted
              ? VoiceListeningStatus.unavailable
              : VoiceListeningStatus.error,
          feedbackMessage: permitted
              ? VoiceInputMessages.unavailable
              : VoiceInputMessages.permissionPermanentlyDenied,
        );
        return false;
      }

      _initialized = true;
      return true;
    } catch (_) {
      state = state.copyWith(
        status: VoiceListeningStatus.error,
        feedbackMessage: VoiceInputMessages.genericError,
      );
      return false;
    }
  }

  void _onSpeechError(String errorCode) {
    if (errorCode.contains('permission')) {
      state = state.copyWith(
        status: VoiceListeningStatus.error,
        feedbackMessage: VoiceInputMessages.permissionDenied,
      );
      return;
    }

    if (errorCode.contains('no_match') ||
        errorCode.contains('speech_timeout')) {
      state = state.copyWith(
        status: VoiceListeningStatus.idle,
        feedbackMessage: VoiceInputMessages.noMatch,
      );
      return;
    }

    state = state.copyWith(
      status: VoiceListeningStatus.error,
      feedbackMessage: VoiceInputMessages.genericError,
    );
  }

  void _onSpeechStatus(String status) {
    if (status == 'done' || status == 'notListening') {
      if (state.isListening) {
        final hadWords = state.transcript.trim().isNotEmpty;
        state = state.copyWith(
          status: VoiceListeningStatus.idle,
          feedbackMessage: hadWords ? null : VoiceInputMessages.noMatch,
          clearFeedback: hadWords,
        );
      }
    }
  }
}

final voiceInputControllerProvider =
    NotifierProvider<VoiceInputController, VoiceInputState>(
      VoiceInputController.new,
    );
