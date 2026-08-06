/// Resultado da sanitização de texto para TTS.
class SpeakableText {
  const SpeakableText._({required this.text, required this.isSpeakable});

  factory SpeakableText.speakable(String text) =>
      SpeakableText._(text: text, isSpeakable: true);

  factory SpeakableText.skip([String text = '']) =>
      SpeakableText._(text: text, isSpeakable: false);

  final String text;
  final bool isSpeakable;
}

/// Sanitiza e valida texto do assistente antes do TTS.
///
/// Helper puro (sem UI / plugins): remove Markdown ruidoso, blocos de código,
/// URLs longas e conteúdos claramente não speakable (JSON, IDs, só emoji).
SpeakableText sanitizeForTts(String raw) {
  var text = raw;

  // Blocos de código cercados (``` ... ```).
  text = text.replaceAll(RegExp(r'```[\s\S]*?```'), ' ');

  // Inline code.
  text = text.replaceAllMapped(
    RegExp(r'`([^`]*)`'),
    (match) => match.group(1) ?? '',
  );

  // Links Markdown [texto](url) → texto.
  text = text.replaceAllMapped(
    RegExp(r'\[([^\]]+)\]\(([^)]+)\)'),
    (match) => match.group(1) ?? '',
  );

  // Imagens Markdown ![alt](url) → alt.
  text = text.replaceAllMapped(
    RegExp(r'!\[([^\]]*)\]\(([^)]+)\)'),
    (match) => match.group(1) ?? '',
  );

  // URLs http(s) completas (omitir — não falar).
  text = text.replaceAll(RegExp(r'https?:\/\/\S+', caseSensitive: false), ' ');

  // Cabeçalhos / ênfase Markdown residual.
  text = text.replaceAll(RegExp(r'^#{1,6}\s*', multiLine: true), '');
  text = text.replaceAllMapped(
    RegExp(r'(\*\*|__)(.+?)\1'),
    (match) => match.group(2) ?? '',
  );
  text = text.replaceAllMapped(
    RegExp(r'(\*|_)(.+?)\1'),
    (match) => match.group(2) ?? '',
  );
  text = text.replaceAllMapped(
    RegExp(r'~~(.+?)~~'),
    (match) => match.group(1) ?? '',
  );

  // Listas Markdown no início da linha.
  text = text.replaceAll(RegExp(r'^\s*[-*+]\s+', multiLine: true), '');
  text = text.replaceAll(RegExp(r'^\s*\d+\.\s+', multiLine: true), '');

  // Emojis e símbolos pictográficos comuns (Unicode ranges amplos).
  text = text.replaceAll(
    RegExp(
      r'[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]',
      unicode: true,
    ),
    ' ',
  );

  // Colapsa whitespace.
  text = text.replaceAll(RegExp(r'\s+'), ' ').trim();

  if (text.isEmpty) {
    return SpeakableText.skip();
  }

  if (_looksLikeJson(text)) {
    return SpeakableText.skip(text);
  }

  if (_looksLikeTechnicalId(text)) {
    return SpeakableText.skip(text);
  }

  if (_looksLikeSystemOrErrorLiteral(text)) {
    return SpeakableText.skip(text);
  }

  // Após remover emojis/markup, se só restarem símbolos sem letras/números → skip.
  if (!RegExp(r'[\p{L}\p{N}]', unicode: true).hasMatch(text)) {
    return SpeakableText.skip(text);
  }

  return SpeakableText.speakable(text);
}

bool _looksLikeJson(String text) {
  final trimmed = text.trim();
  if (!(trimmed.startsWith('{') && trimmed.endsWith('}')) &&
      !(trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return false;
  }
  // Heurística: chave JSON típica ou array — sem prosa longa solta.
  return RegExp(r'''["']?\w+["']?\s*:''').hasMatch(trimmed) ||
      trimmed.startsWith('[');
}

bool _looksLikeTechnicalId(String text) {
  // UUID ou IDs longos alfanuméricos sem espaços (ex.: msg_abc123...).
  if (RegExp(
    r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
  ).hasMatch(text)) {
    return true;
  }
  if (!text.contains(' ') &&
      text.length >= 16 &&
      RegExp(r'^[A-Za-z0-9_\-]+$').hasMatch(text)) {
    return true;
  }
  return false;
}

bool _looksLikeSystemOrErrorLiteral(String text) {
  final lower = text.toLowerCase();
  const markers = <String>[
    'internal server error',
    'stack trace',
    'exception:',
    'nullpointerexception',
    'socketexception',
    'erro interno do sistema',
    'system message:',
    '[system]',
  ];
  for (final marker in markers) {
    if (lower.contains(marker)) {
      return true;
    }
  }
  return false;
}
