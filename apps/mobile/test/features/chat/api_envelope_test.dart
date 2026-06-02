import 'package:conecta_geracao/core/network/api_envelope.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('api envelope', () {
    test('unwrapData extracts nested data object', () {
      final result = unwrapData({
        'data': {'id': 'conv-1', 'status': 'in_progress'},
        'meta': {'requestId': 'req-1'},
      });

      expect(result['id'], 'conv-1');
    });

    test('unwrapDataList extracts list from paginated response', () {
      final items = unwrapDataList({
        'data': [
          {'id': 'conv-1'},
          {'id': 'conv-2'},
        ],
        'meta': {'page': 1, 'limit': 20, 'total': 2},
      });

      expect(items, hasLength(2));
    });
  });
}
