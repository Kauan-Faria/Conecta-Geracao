const SENSITIVE_INPUT_PATTERNS = [
  /\bsenha\b/i,
  /\bpassword\b/i,
  /\bpin\b/i,
  /\botp\b/i,
  /\btoken\b/i,
  /\bcódigo\s+de\s+verificação\b/i,
  /\bcodigo\s+de\s+verificacao\b/i,
  /\bcredencial\b/i,
  /\b\d{4,8}\b.*\b(código|codigo|verificação|verificacao)\b/i,
];

const SENSITIVE_OUTPUT_PATTERNS = [
  /\b(digite|informe|me\s+diga|envie)\s+(sua\s+)?(senha|pin|otp|token)\b/i,
  /\bqual\s+é\s+sua\s+senha\b/i,
  /\bme\s+passe\s+o\s+código\b/i,
];

export class SensitiveContentPolicy {
  containsSensitiveInput(text: string): boolean {
    const normalized = text.trim();
    return SENSITIVE_INPUT_PATTERNS.some((pattern) => pattern.test(normalized));
  }

  containsUnsafeOutput(text: string): boolean {
    const normalized = text.trim();
    return SENSITIVE_OUTPUT_PATTERNS.some((pattern) => pattern.test(normalized));
  }

  refusalMessage(): string {
    return (
      'Por segurança, não peça nem envie senhas, PIN, OTP ou códigos de verificação aqui. ' +
      'Digite essas informações apenas no app oficial do seu banco ou no site gov.br. ' +
      'Posso continuar te orientando passo a passo sem precisar desses dados.'
    );
  }

  sanitizeForLog(text: string): string {
    let masked = text;
    masked = masked.replace(/\b\d{4,}\b/g, '****');
    masked = masked.replace(
      /\b(senha|password|pin|otp|token)\s*[:=]?\s*\S+/gi,
      '$1=***',
    );
    if (masked.length > 120) {
      return `${masked.slice(0, 120)}…`;
    }
    return masked;
  }
}
