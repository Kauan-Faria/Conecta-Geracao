class PaginatedResult<T> {
  const PaginatedResult({
    required this.items,
    required this.page,
    required this.limit,
    required this.total,
  });

  final List<T> items;
  final int page;
  final int limit;
  final int total;

  bool get hasMore => page * limit < total;
}

Map<String, dynamic> unwrapData(Map<String, dynamic> body) {
  final data = body['data'];
  if (data is Map<String, dynamic>) {
    return data;
  }
  if (data == null) {
    return body;
  }
  return body;
}

List<dynamic> unwrapDataList(Map<String, dynamic> body) {
  final data = body['data'];
  if (data is List<dynamic>) {
    return data;
  }
  return const [];
}

Map<String, dynamic>? unwrapMeta(Map<String, dynamic> body) {
  final meta = body['meta'];
  if (meta is Map<String, dynamic>) {
    return meta;
  }
  return null;
}
