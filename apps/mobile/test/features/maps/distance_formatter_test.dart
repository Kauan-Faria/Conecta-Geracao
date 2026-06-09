import 'package:conecta_geracao/features/maps/domain/distance_formatter.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('formatPoiDistance', () {
    test('formats meters below one kilometer', () {
      expect(formatPoiDistance(350), 'a 350 metros');
      expect(formatPoiDistance(999), 'a 999 metros');
    });

    test('formats kilometers with decimal comma', () {
      expect(formatPoiDistance(1200), 'a 1,2 km');
    });

    test('formats whole kilometers', () {
      expect(formatPoiDistance(5000), 'a 5 km');
      expect(formatPoiDistance(12000), 'a 12 km');
    });
  });
}
