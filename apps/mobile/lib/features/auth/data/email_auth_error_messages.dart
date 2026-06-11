/// Mensagens PT-BR para erros Firebase de e-mail/senha.
String mapEmailPasswordAuthError(String code) {
  switch (code) {
    case 'email-already-in-use':
      return 'Este e-mail já está em uso';
    case 'invalid-email':
      return 'E-mail inválido';
    case 'weak-password':
      return 'Senha muito fraca. Use pelo menos 6 caracteres';
    case 'wrong-password':
    case 'invalid-credential':
      return 'E-mail ou senha incorretos';
    case 'user-not-found':
      return 'Conta não encontrada';
    case 'network-request-failed':
      return 'Precisa de internet para entrar';
    case 'too-many-requests':
      return 'Muitas tentativas. Aguarde um momento.';
    default:
      return 'Não foi possível entrar. Tente novamente.';
  }
}

/// Mensagens para reset de senha — não revela se o e-mail existe.
String mapPasswordResetError(String code) {
  switch (code) {
    case 'invalid-email':
      return 'E-mail inválido';
    case 'network-request-failed':
      return 'Precisa de internet para enviar o e-mail';
    case 'too-many-requests':
      return 'Muitas tentativas. Aguarde um momento.';
    default:
      return 'Não foi possível enviar o e-mail. Tente novamente.';
  }
}
