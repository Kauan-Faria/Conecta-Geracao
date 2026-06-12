import 'package:conecta_geracao/features/auth/domain/phone_country.dart';
import 'package:conecta_geracao/features/auth/presentation/widgets/international_phone_field.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('InternationalPhoneField', () {
    testWidgets('shows Brazil by default with aligned selector and field', (
      tester,
    ) async {
      final controller = TextEditingController();
      addTearDown(controller.dispose);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: InternationalPhoneField(
              controller: controller,
              selectedCountry: PhoneCountry.defaultCountry,
              onCountryChanged: (_) {},
            ),
          ),
        ),
      );

      expect(find.text('+55'), findsOneWidget);
      expect(find.text('🇧🇷'), findsOneWidget);
      expect(find.byType(IntrinsicHeight), findsOneWidget);
    });

    testWidgets('updates mask hint when country changes', (tester) async {
      final controller = TextEditingController();
      var selected = PhoneCountry.brazil;
      addTearDown(controller.dispose);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: StatefulBuilder(
              builder: (context, setState) {
                return InternationalPhoneField(
                  controller: controller,
                  selectedCountry: selected,
                  onCountryChanged: (country) {
                    setState(() {
                      selected = country;
                      controller.clear();
                    });
                  },
                );
              },
            ),
          ),
        ),
      );

      expect(find.text('(00) 00000-0000'), findsOneWidget);

      final portugal = PhoneCountry.all.firstWhere((c) => c.isoCode == 'PT');
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: InternationalPhoneField(
              controller: controller,
              selectedCountry: portugal,
              onCountryChanged: (_) {},
            ),
          ),
        ),
      );
      await tester.pump();

      expect(find.text('000 000 000'), findsOneWidget);
    });

    testWidgets('formats digits according to selected country', (tester) async {
      final controller = TextEditingController();
      addTearDown(controller.dispose);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: InternationalPhoneField(
              controller: controller,
              selectedCountry: PhoneCountry.brazil,
              onCountryChanged: (_) {},
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField).last, '11999999999');
      await tester.pump();

      expect(controller.text, '(11) 99999-9999');
    });
  });
}
