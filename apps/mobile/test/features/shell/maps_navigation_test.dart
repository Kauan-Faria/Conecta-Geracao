import 'package:conecta_geracao/features/maps/presentation/maps_search_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/fake_auth_repository.dart';
import '../../helpers/maps_test_helpers.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Maps shell navigation', () {
    testWidgets('authenticated user opens in-app maps from tab', (
      tester,
    ) async {
      await pumpShellApp(tester, user: authenticatedTestUser);

      await tester.tap(find.text('Mapas'));
      await tester.pumpAndSettle();

      expect(find.byType(MapsSearchPage), findsOneWidget);
      expectMapsTabActive(tester);
    });

    testWidgets('guest user sees maps tab and opens in-app maps', (
      tester,
    ) async {
      await pumpShellApp(tester, guestSession: true);

      expect(find.text('Mapas'), findsWidgets);

      await tester.tap(find.text('Mapas'));
      await tester.pumpAndSettle();

      expect(find.byType(MapsSearchPage), findsOneWidget);
      expectMapsTabActive(tester);
    });

    testWidgets('deep link /maps activates maps tab', (tester) async {
      final container = await pumpShellApp(tester, user: authenticatedTestUser);

      await navigateToMaps(container);
      await tester.pumpAndSettle();

      expect(find.byType(MapsSearchPage), findsOneWidget);
      expectMapsTabActive(tester);

      final navigationBar = tester.widget<NavigationBar>(
        find.byType(NavigationBar),
      );
      expect(navigationBar.selectedIndex, 1);
    });

    testWidgets('maps navigation destination meets minimum touch target', (
      tester,
    ) async {
      await pumpShellApp(tester, user: authenticatedTestUser);

      final navigationBar = tester.widget<NavigationBar>(
        find.byType(NavigationBar),
      );
      final mapsDestination =
          navigationBar.destinations[1] as NavigationDestination;
      expect(mapsDestination.label, 'Mapas');

      expect(find.byIcon(Icons.map_outlined), findsOneWidget);

      final navigationBarSize = tester.getSize(find.byType(NavigationBar));
      expect(navigationBarSize.height, greaterThanOrEqualTo(48));
    });
  });
}
