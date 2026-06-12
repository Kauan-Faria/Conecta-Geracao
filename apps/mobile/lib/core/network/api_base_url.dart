import 'dart:io' show Platform;

const _apiBaseUrlFromEnv = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: '',
);

/// URL padrão da API quando `API_BASE_URL` não foi passada no build.
///
/// - Android emulador: `10.0.2.2` mapeia para o localhost da máquina host.
/// - iOS simulador / desktop: `localhost` funciona direto.
String defaultApiBaseUrlForPlatform() {
  if (Platform.isAndroid) {
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
