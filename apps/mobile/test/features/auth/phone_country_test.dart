import 'package:conecta_geracao/features/auth/domain/phone_country.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('PhoneCountry', () {
    test('default country is Brazil', () {
      expect(PhoneCountry.defaultCountry.isoCode, 'BR');
      expect(PhoneCountry.defaultCountry.dialCodeDisplay, '+55');
    });

    test('formats Brazil display mask', () {
      final br = PhoneCountry.brazil;
      expect(br.formatDisplay('11999999999'), '(11) 99999-9999');
      expect(br.toE164('(11) 99999-9999'), '+5511999999999');
      expect(br.isComplete('11999999999'), isTrue);
    });

    test('formats US display mask', () {
      final us = PhoneCountry.all.firstWhere((c) => c.isoCode == 'US');
      expect(us.formatDisplay('2025551234'), '(202) 555-1234');
      expect(us.toE164('(202) 555-1234'), '+12025551234');
    });

    test('formats Portugal display mask', () {
      final pt = PhoneCountry.all.firstWhere((c) => c.isoCode == 'PT');
      expect(pt.formatDisplay('912345678'), '912 345 678');
      expect(pt.toE164('912 345 678'), '+351912345678');
    });

    test('search filters by Portuguese name', () {
      final results = PhoneCountry.search('port');
      expect(results.any((c) => c.isoCode == 'PT'), isTrue);
    });

    test('search filters by dial code', () {
      final results = PhoneCountry.search('351');
      expect(results.any((c) => c.isoCode == 'PT'), isTrue);
    });

    test('search with no matches returns empty list', () {
      expect(PhoneCountry.search('zzzz-not-a-country'), isEmpty);
    });

    test('catalog includes Americas Portugal and diaspora countries', () {
      final isoCodes = PhoneCountry.all.map((c) => c.isoCode).toSet();
      expect(isoCodes, contains('BR'));
      expect(isoCodes, contains('US'));
      expect(isoCodes, contains('AR'));
      expect(isoCodes, contains('PT'));
      expect(isoCodes, contains('DE'));
      expect(isoCodes, contains('TL'));
    });
  });
}
