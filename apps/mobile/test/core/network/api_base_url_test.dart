import 'package:conecta_geracao/core/network/api_base_url.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('resolveApiBaseUrl returns a non-empty URL', () {
    expect(resolveApiBaseUrl(), isNotEmpty);
    expect(resolveApiBaseUrl(), startsWith('http://'));
  });
}
