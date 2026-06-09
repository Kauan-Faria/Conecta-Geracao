/// Formata e valida telefones brasileiros para exibição e E.164 (+55).
class BrazilPhoneFormatter {
  static String formatDisplay(String digitsOnly) {
    final digits = digitsOnly.replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) {
      return '';
    }
    if (digits.length <= 2) {
      return '($digits';
    }
    if (digits.length <= 7) {
      return '(${digits.substring(0, 2)}) ${digits.substring(2)}';
    }
    if (digits.length <= 11) {
      final ddd = digits.substring(0, 2);
      final rest = digits.substring(2);
      if (rest.length <= 4) {
        return '($ddd) $rest';
      }
      return '($ddd) ${rest.substring(0, rest.length - 4)}-${rest.substring(rest.length - 4)}';
    }
    return '(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}';
  }

  /// Retorna +55DDDNÚMERO ou null se incompleto/inválido (10–11 dígitos nacionais).
  static String? toE164(String input) {
    final digits = input.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 10 || digits.length > 11) {
      return null;
    }
    return '+55$digits';
  }

  static bool isComplete(String input) => toE164(input) != null;
}
