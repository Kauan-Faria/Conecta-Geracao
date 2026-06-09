import 'package:conecta_geracao/core/theme/app_theme.dart';
import 'package:conecta_geracao/features/accessibility/domain/accessibility_prefs.dart';
import 'package:conecta_geracao/features/maps/domain/geo_point.dart';
import 'package:conecta_geracao/features/maps/domain/poi_category.dart';
import 'package:conecta_geracao/features/maps/domain/poi_result.dart';
import 'package:conecta_geracao/features/maps/presentation/location_controller.dart';
import 'package:conecta_geracao/features/maps/presentation/maps_providers.dart';
import 'package:conecta_geracao/features/maps/presentation/maps_search_page.dart';
import 'package:conecta_geracao/features/maps/presentation/widgets/maps_category_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import '../../helpers/fake_maps_repository.dart';

class FixedLocationController extends LocationController {
  @override
  LocationState build() => const LocationState(
    center: GeoPoint(lat: -22.9056, lon: -47.0608),
  );

  @override
  Future<GeoPoint?> ensureCenter({GeoPoint? presetCenter}) async {
    return state.center;
  }
}

class DeniedLocationController extends LocationController {
  @override
  LocationState build() => const LocationState(
    permissionDenied: true,
    errorMessage: 'Informe seu bairro ou cidade para buscar lugares.',
  );

  @override
  Future<GeoPoint?> ensureCenter({GeoPoint? presetCenter}) async => null;
}

Future<void> pumpMapsSearchPage(
  WidgetTester tester, {
  required List<Override> overrides,
  GoRouter? router,
}) async {
  tester.view.physicalSize = const Size(400, 1200);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);

  final child = ProviderScope(
    overrides: overrides,
    child: router == null
        ? MaterialApp(
            theme: buildAppTheme(const AccessibilityPrefs()),
            home: const MapsSearchPage(),
          )
        : MaterialApp.router(
            theme: buildAppTheme(const AccessibilityPrefs()),
            routerConfig: router,
          ),
  );

  await tester.pumpWidget(child);
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 100));
}

Future<void> selectCategoryAndSearch(WidgetTester tester) async {
  await tester.tap(find.text('Farmácia'));
  await tester.pump();
  await tester.tap(find.text('Buscar lugares'));
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 100));
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('MapsSearchPage', () {
    testWidgets('shows category buttons with icons and updated labels', (
      tester,
    ) async {
      await pumpMapsSearchPage(
        tester,
        overrides: [
          locationControllerProvider.overrideWith(FixedLocationController.new),
        ],
      );

      expect(find.text('Hospital/UPA'), findsOneWidget);
      expect(find.text('Banco/Lotérica'), findsOneWidget);
      expect(find.text('Supermercado'), findsOneWidget);
      expect(find.byType(MapsCategoryButton), findsNWidgets(6));
      expect(find.byIcon(PoiCategory.pharmacy.icon), findsOneWidget);
    });

    testWidgets('shows manual place fallback when permission denied', (
      tester,
    ) async {
      await pumpMapsSearchPage(
        tester,
        overrides: [
          locationControllerProvider.overrideWith(DeniedLocationController.new),
          mapsRepositoryProvider.overrideWithValue(FakeMapsRepository()),
        ],
      );

      expect(find.text('Bairro ou cidade'), findsOneWidget);
      expect(
        find.bySemanticsLabel('Usar bairro ou cidade informado'),
        findsOneWidget,
      );
    });

    testWidgets('search renders results with formatted distance', (
      tester,
    ) async {
      final results = [
        const PoiResult(
          osmId: '1',
          name: 'Farmácia Popular',
          address: 'Av. Brasil, 100',
          lat: -22.91,
          lon: -47.07,
          distanceMeters: 450,
        ),
      ];

      await pumpMapsSearchPage(
        tester,
        overrides: [
          locationControllerProvider.overrideWith(FixedLocationController.new),
          mapsRepositoryProvider.overrideWithValue(
            FakeMapsRepository(searchResults: results),
          ),
        ],
      );

      await selectCategoryAndSearch(tester);

      expect(find.text('Farmácia Popular'), findsOneWidget);
      expect(find.textContaining('a 450 metros'), findsOneWidget);
    });

    testWidgets('empty search shows story-aligned message', (tester) async {
      await pumpMapsSearchPage(
        tester,
        overrides: [
          locationControllerProvider.overrideWith(FixedLocationController.new),
          mapsRepositoryProvider.overrideWithValue(FakeMapsRepository()),
        ],
      );

      await selectCategoryAndSearch(tester);

      expect(
        find.text(
          'Não encontrei nenhum lugar por perto. Tente aumentar a distância.',
        ),
        findsOneWidget,
      );
    });

    testWidgets('tapping result navigates to route page', (tester) async {
      final router = GoRouter(
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const MapsSearchPage(),
          ),
          GoRoute(
            path: '/maps/route',
            builder: (context, state) => const Scaffold(
              body: Text('Rota no mapa'),
            ),
          ),
        ],
      );

      final results = [
        const PoiResult(
          osmId: '1',
          name: 'Farmácia Popular',
          address: 'Av. Brasil, 100',
          lat: -22.91,
          lon: -47.07,
          distanceMeters: 450,
        ),
      ];

      await pumpMapsSearchPage(
        tester,
        overrides: [
          locationControllerProvider.overrideWith(FixedLocationController.new),
          mapsRepositoryProvider.overrideWithValue(
            FakeMapsRepository(searchResults: results),
          ),
        ],
        router: router,
      );

      await selectCategoryAndSearch(tester);
      await tester.tap(find.text('Farmácia Popular'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Rota no mapa'), findsOneWidget);
    });
  });
}
