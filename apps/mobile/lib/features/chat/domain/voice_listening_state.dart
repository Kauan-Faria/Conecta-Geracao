enum VoiceListeningStatus {
  idle,
  listening,
  unavailable,
  error,
}

/// Mensagens amigáveis para feedback de voz (SnackBar / Semantics).
abstract final class VoiceInputMessages {
  static const permissionDenied =
      'Precisamos do microfone para gravar. Você ainda pode digitar.';
  static const permissionPermanentlyDenied =
      'Microfone bloqueado. Ative nas configurações do celular para gravar. '
      'Enquanto isso, use o teclado.';
  static const unavailable =
      'A gravação de voz não está disponível neste aparelho. Use o teclado.';
  static const noMatch =
      'Não entendi. Tente de novo ou digite a mensagem.';
  static const genericError =
      'Não foi possível gravar agora. Tente de novo ou digite.';
  static const androidOnlySoon =
      'Gravação de voz disponível no Android em breve. Use o teclado.';
  static const recordSemanticLabel = 'Gravar mensagem de voz';
  static const stopSemanticLabel = 'Parar gravação';
  static const recordButtonLabel = 'Gravar';
  static const stopButtonLabel = 'Parar';
  static const unavailableSemanticLabel =
      'Gravar mensagem de voz, indisponível';
}

String voiceButtonLabel(VoiceListeningStatus status) {
  return status == VoiceListeningStatus.listening
      ? VoiceInputMessages.stopButtonLabel
      : VoiceInputMessages.recordButtonLabel;
}

String voiceButtonSemanticLabel(VoiceListeningStatus status) {
  switch (status) {
    case VoiceListeningStatus.listening:
      return VoiceInputMessages.stopSemanticLabel;
    case VoiceListeningStatus.unavailable:
    case VoiceListeningStatus.error:
      return VoiceInputMessages.unavailableSemanticLabel;
    case VoiceListeningStatus.idle:
      return VoiceInputMessages.recordSemanticLabel;
  }
}
