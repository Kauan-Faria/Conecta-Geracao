/// Um vídeo-tutorial exibido na aba "Tutoriais".
class Tutorial {
  const Tutorial({
    required this.id,
    required this.title,
    required this.youtubeUrl,
  });

  final String id;
  final String title;
  final String youtubeUrl;

  /// ID do vídeo do YouTube extraído de [youtubeUrl], ou `null` se a URL for
  /// inválida / sem um ID reconhecível.
  String? get videoId => extractYoutubeVideoId(youtubeUrl);
}

final RegExp _youtubeUrlPattern = RegExp(
  r'(?:youtube(?:-nocookie)?\.com/(?:watch\?(?:.*&)?v=|embed/|shorts/|v/)|youtu\.be/)([A-Za-z0-9_-]{11})',
);

final RegExp _rawIdPattern = RegExp(r'^[A-Za-z0-9_-]{11}$');

/// Extrai o ID de 11 caracteres de um vídeo do YouTube a partir de formatos
/// comuns de URL: `watch?v=`, `youtu.be/`, `embed/`, `shorts/`, `v/`.
///
/// Também aceita um ID "cru" (11 caracteres). Retorna `null` quando a entrada
/// não contém um ID reconhecível, permitindo que a UI exiba um estado de erro
/// amigável em vez de quebrar.
String? extractYoutubeVideoId(String url) {
  final trimmed = url.trim();
  if (trimmed.isEmpty) {
    return null;
  }

  final match = _youtubeUrlPattern.firstMatch(trimmed);
  if (match != null) {
    return match.group(1);
  }

  if (_rawIdPattern.hasMatch(trimmed)) {
    return trimmed;
  }

  return null;
}
