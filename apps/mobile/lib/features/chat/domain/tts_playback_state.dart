enum TtsPlaybackStatus {
  idle,
  loading,
  speaking,
  stopped,
  error,
}

/// Mensagens e labels acessíveis para leitura em voz alta.
///
/// `paused` não é exposto: pause do plugin é instável no Android (ver serviço).
abstract final class TtsPlaybackMessages {
  static const speakSemanticLabel = 'Ouvir resposta';
  static const stopSemanticLabel = 'Parar leitura';
  static const speakButtonLabel = 'Ouvir';
  static const stopButtonLabel = 'Parar';
  static const autoTtsOnSemanticLabel = 'Ler respostas em voz alta, ligado';
  static const autoTtsOffSemanticLabel = 'Ler respostas em voz alta, desligado';
  static const autoTtsToggleTooltipOn = 'Desligar leitura automática';
  static const autoTtsToggleTooltipOff = 'Ligar leitura automática';
  static const unavailable =
      'A leitura em voz alta não está disponível neste aparelho.';
  static const androidOnlySoon =
      'Leitura em voz alta disponível no Android em breve.';
  static const genericError =
      'Não foi possível ler a resposta agora. O texto continua disponível.';
}

String ttsActionSemanticLabel(
  TtsPlaybackStatus status, {
  required bool isActiveMessage,
}) {
  if (status == TtsPlaybackStatus.speaking && isActiveMessage) {
    return TtsPlaybackMessages.stopSemanticLabel;
  }
  return TtsPlaybackMessages.speakSemanticLabel;
}

String ttsActionButtonLabel(
  TtsPlaybackStatus status, {
  required bool isActiveMessage,
}) {
  if (status == TtsPlaybackStatus.speaking && isActiveMessage) {
    return TtsPlaybackMessages.stopButtonLabel;
  }
  return TtsPlaybackMessages.speakButtonLabel;
}

String autoTtsSemanticLabel(bool enabled) {
  return enabled
      ? TtsPlaybackMessages.autoTtsOnSemanticLabel
      : TtsPlaybackMessages.autoTtsOffSemanticLabel;
}
