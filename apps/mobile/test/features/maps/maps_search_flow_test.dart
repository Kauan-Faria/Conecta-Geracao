import 'package:conecta_geracao/features/maps/domain/geo_point.dart';
import 'package:conecta_geracao/features/maps/domain/poi_category.dart';
import 'package:conecta_geracao/features/maps/domain/poi_result.dart';
import 'package:conecta_geracao/features/maps/presentation/location_controller.dart';
import 'package:conecta_geracao/features/maps/presentation/maps_providers.dart';
import 'package:conecta_geracao/features/maps/presentation/maps_search_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/fake_maps_repository.dart';

class TestLocationController extends LocationController {
  TestLocationController(this._presetCenter);

  final GeoPoint? _presetCenter;

  @override
  LocationState build() => LocationState(
    center: _presetCenter,
    permissionDenied: _presetCenter == null,
    errorMessage: _presetCenter == null
        ? 'Informe seu bairro ou cidade para buscar lugares.'
        : null,
  );

  @override
  Future<GeoPoint?> ensureCenter({GeoPoint? presetCenter}) async {
    final center = presetCenter ?? _presetCenter;
    if (center != null) {
      state = state.copyWith(center: center, permissionDenied: false);
    }
    return center;
  }
}

void main() {
  group('LocationController', () {
    test('geocodeManualPlace returns center on success', () async {
      final container = ProviderContainer(
        overrides: [
          mapsRepositoryProvider.overrideWithValue(
            FakeMapsRepository(
              geocodeResult: const GeoPoint(lat: -22.9, lon: -47.06),
            ),
          ),
        ],
      );
      addTearDown(container.dispose);

      final controller = container.read(locationControllerProvider.notifier);
      final center = await controller.geocodeManualPlace('Centro, Campinas');

      expect(center, isNotNull);
      expect(container.read(locationControllerProvider).center, center);
      expect(container.read(locationControllerProvider).errorMessage, isNull);
    });

    test('geocodeManualPlace rejects short query', () async {
      final container = ProviderContainer(
        overrides: [
          mapsRepositoryProvider.overrideWithValue(FakeMapsRepository()),
        ],
      );
      addTearDown(container.dispose);

      final controller = container.read(locationControllerProvider.notifier);
      final center = await controller.geocodeManualPlace('A');

      expect(center, isNull);
      expect(
        container.read(locationControllerProvider).errorMessage,
        'Digite pelo menos 2 letras do bairro ou cidade.',
      );
    });

    test('geocodeManualPlace shows story-aligned error on failure', () async {
      final container = ProviderContainer(
        overrides: [
          mapsRepositoryProvider.overrideWithValue(
            FakeMapsRepository(geocodeThrows: true),
          ),
        ],
      );
      addTearDown(container.dispose);

      final controller = container.read(locationControllerProvider.notifier);
      final center = await controller.geocodeManualPlace('Lugar inválido');

      expect(center, isNull);
      expect(
        container.read(locationControllerProvider).errorMessage,
        'Não encontrei esse lugar. Tente outro bairro.',
      );
    });
  });

  group('MapsSearchController', () {
    test('search requires category selection', () async {
      final container = ProviderContainer(
        overrides: [
          mapsRepositoryProvider.overrideWithValue(FakeMapsRepository()),
          locationControllerProvider.overrideWith(
            () =>
                TestLocationController(const GeoPoint(lat: -22.9, lon: -47.06)),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(mapsSearchControllerProvider.notifier).search();

      expect(
        container.read(mapsSearchControllerProvider).errorMessage,
        'Escolha o tipo de lugar que você procura.',
      );
    });

    test('search shows empty message when no POIs found', () async {
      final container = ProviderContainer(
        overrides: [
          mapsRepositoryProvider.overrideWithValue(FakeMapsRepository()),
          locationControllerProvider.overrideWith(
            () =>
                TestLocationController(const GeoPoint(lat: -22.9, lon: -47.06)),
          ),
        ],
      );
      addTearDown(container.dispose);

      final controller = container.read(mapsSearchControllerProvider.notifier);
      controller.selectCategory(PoiCategory.pharmacy);
      await controller.search();

      expect(container.read(mapsSearchControllerProvider).results, isEmpty);
      expect(
        container.read(mapsSearchControllerProvider).errorMessage,
        'Não encontrei nenhum lugar por perto. Tente aumentar a distância.',
      );
    });

    test('search stores results ordered from repository', () async {
      final results = [
        const PoiResult(
          osmId: '1',
          name: 'Farmácia Central',
          address: 'Rua A',
          lat: -22.91,
          lon: -47.07,
          distanceMeters: 300,
        ),
        const PoiResult(
          osmId: '2',
          name: 'Farmácia Norte',
          address: 'Rua B',
          lat: -22.92,
          lon: -47.08,
          distanceMeters: 800,
        ),
      ];

      final container = ProviderContainer(
        overrides: [
          mapsRepositoryProvider.overrideWithValue(
            FakeMapsRepository(searchResults: results),
          ),
          locationControllerProvider.overrideWith(
            () =>
                TestLocationController(const GeoPoint(lat: -22.9, lon: -47.06)),
          ),
        ],
      );
      addTearDown(container.dispose);

      final controller = container.read(mapsSearchControllerProvider.notifier);
      controller.selectCategory(PoiCategory.pharmacy);
      await controller.search();

      expect(container.read(mapsSearchControllerProvider).results, results);
      expect(container.read(mapsSearchControllerProvider).errorMessage, isNull);
    });
  });
}
