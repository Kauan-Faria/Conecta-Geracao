import 'dart:convert';

import 'package:conecta_geracao/core/network/api_exception.dart';
import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';

typedef IdTokenProvider = Future<String?> Function();

class ApiClient {
  ApiClient({
    required this.getIdToken,
    this.baseUrl = const String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'http://localhost:3000',
    ),
    http.Client? httpClient,
    Uuid? uuid,
  })  : _http = httpClient ?? http.Client(),
        _uuid = uuid ?? const Uuid();

  final IdTokenProvider getIdToken;
  final String baseUrl;
  final http.Client _http;
  final Uuid _uuid;

  Future<Map<String, String>> buildHeaders() async {
    final token = await getIdToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-Id': _uuid.v4(),
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> get(String path) async {
    final uri = Uri.parse('$baseUrl$path');
    final headers = await buildHeaders();
    final response = await _http.get(uri, headers: headers);
    return _decodeResponse(response);
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    final headers = await buildHeaders();
    final response = await _http.post(
      uri,
      headers: headers,
      body: body == null ? null : jsonEncode(body),
    );
    return _decodeResponse(response);
  }

  Map<String, dynamic> _decodeResponse(http.Response response) {
    final body = response.body.isEmpty
        ? <String, dynamic>{}
        : jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    throw ApiException.fromResponse(response.statusCode, body);
  }
}
