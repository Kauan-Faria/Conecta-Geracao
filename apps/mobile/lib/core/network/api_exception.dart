class ApiFieldError {
  const ApiFieldError({required this.field, required this.message});

  final String field;
  final String message;

  factory ApiFieldError.fromJson(Map<String, dynamic> json) {
    return ApiFieldError(
      field: json['field'] as String? ?? '',
      message: json['message'] as String? ?? '',
    );
  }
}

class ApiException implements Exception {
  const ApiException({
    required this.statusCode,
    required this.code,
    required this.message,
    this.errors = const [],
  });

  final int statusCode;
  final String code;
  final String message;
  final List<ApiFieldError> errors;

  factory ApiException.fromResponse(int statusCode, Map<String, dynamic> body) {
    final error = body['error'] as Map<String, dynamic>? ?? {};
    final errorsRaw = body['errors'] as List<dynamic>? ?? [];
    return ApiException(
      statusCode: statusCode,
      code: error['code'] as String? ?? 'UNKNOWN',
      message: error['message'] as String? ??
          'Algo deu errado. Tente novamente.',
      errors: errorsRaw
          .whereType<Map<String, dynamic>>()
          .map(ApiFieldError.fromJson)
          .toList(),
    );
  }

  String get userMessage {
    if (statusCode == 401) {
      return 'Precisa entrar na conta para usar o chat.';
    }
    if (statusCode >= 500) {
      return 'Servidor indisponível. Tente novamente em instantes.';
    }
    return message;
  }

  @override
  String toString() => 'ApiException($statusCode, $code, $message)';
}
