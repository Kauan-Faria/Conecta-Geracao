import 'package:conecta_geracao/features/auth/domain/brazil_phone_formatter.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('BrazilPhoneFormatter', () {
    test('toE164 accepts 11-digit mobile', () {
      expect(BrazilPhoneFormatter.toE164('11987654321'), '+5511987654321');
    });

    test('toE164 rejects incomplete number', () {
      expect(BrazilPhoneFormatter.toE164('1198765'), isNull);
    });

    test('isComplete matches valid length', () {
      expect(BrazilPhoneFormatter.isComplete('11987654321'), isTrue);
      expect(BrazilPhoneFormatter.isComplete('119'), isFalse);
    });
  });
}
