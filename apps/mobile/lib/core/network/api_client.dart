import 'package:uuid/uuid.dart';

typedef IdTokenProvider = Future<String?> Function();

class ApiClient {
  ApiClient({
    required this.getIdToken,
    this.baseUrl = const String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'https://api.conectageracao.example',
    ),
    Uuid? uuid,
  }) : _uuid = uuid ?? const Uuid();

  final IdTokenProvider getIdToken;
  final String baseUrl;
  final Uuid _uuid;

  Future<Map<String, String>> buildHeaders() async {
    final token = await getIdToken();
    return {
      'Content-Type': 'application/json',
      'X-Request-Id': _uuid.v4(),
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }
}
