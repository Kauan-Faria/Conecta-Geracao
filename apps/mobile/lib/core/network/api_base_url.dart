import 'package:flutter/foundation.dart'
    show TargetPlatform, defaultTargetPlatform, kIsWeb;

const _apiBaseUrlFromEnv = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: '',
);

/// URL padrão da API quando `API_BASE_URL` não foi passada no build.
///
/// - Android emulador: `10.0.2.2` mapeia para o localhost da máquina host.
/// - iOS simulador / desktop: `localhost` funciona direto.
String defaultApiBaseUrlForPlatform() {
  // No build web o nginx encaminha /api/v1 para o backend no mesmo domínio.
  if (kIsWeb) {
    return '';
  }
  if (defaultTargetPlatform == TargetPlatform.android) {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
}

String resolveApiBaseUrl() {
  if (_apiBaseUrlFromEnv.isNotEmpty) {
    return _apiBaseUrlFromEnv;
  }
  return defaultApiBaseUrlForPlatform();
}
