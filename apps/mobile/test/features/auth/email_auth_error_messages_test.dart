import 'package:conecta_geracao/features/auth/data/email_auth_error_messages.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('mapEmailPasswordAuthError', () {
    test('maps known Firebase codes to PT-BR', () {
      expect(
        mapEmailPasswordAuthError('email-already-in-use'),
        'Este e-mail já está em uso',
      );
      expect(mapEmailPasswordAuthError('invalid-email'), 'E-mail inválido');
      expect(
        mapEmailPasswordAuthError('weak-password'),
        'Senha muito fraca. Use pelo menos 6 caracteres',
      );
      expect(
        mapEmailPasswordAuthError('wrong-password'),
        'E-mail ou senha incorretos',
      );
      expect(
        mapEmailPasswordAuthError('invalid-credential'),
        'E-mail ou senha incorretos',
      );
      expect(
        mapEmailPasswordAuthError('user-not-found'),
        'Conta não encontrada',
      );
      expect(
        mapEmailPasswordAuthError('network-request-failed'),
        'Precisa de internet para entrar',
      );
    });

    test('falls back to generic message', () {
      expect(
        mapEmailPasswordAuthError('unknown-code'),
        'Não foi possível entrar. Tente novamente.',
      );
    });
  });

  group('mapPasswordResetError', () {
    test('does not reveal whether email exists', () {
      expect(mapPasswordResetError('user-not-found'),
          'Não foi possível enviar o e-mail. Tente novamente.');
      expect(mapPasswordResetError('invalid-email'), 'E-mail inválido');
    });
  });
}
