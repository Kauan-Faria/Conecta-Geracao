import 'package:conecta_geracao/core/network/api_client.dart';
import 'package:conecta_geracao/features/maps/data/maps_api.dart';
import 'package:conecta_geracao/features/maps/data/maps_repository.dart';
import 'package:conecta_geracao/features/maps/domain/geo_point.dart';
import 'package:conecta_geracao/features/maps/domain/poi_category.dart';
import 'package:conecta_geracao/features/maps/domain/poi_result.dart';
import 'package:conecta_geracao/features/maps/domain/route_summary.dart';

class FakeMapsRepository extends MapsRepository {
  FakeMapsRepository({
    this.geocodeResult,
    this.searchResults = const [],
    this.geocodeThrows = false,
    this.searchThrows = false,
  }) : super(_NoopMapsApi());

  final GeoPoint? geocodeResult;
  final List<PoiResult> searchResults;
  final bool geocodeThrows;
  final bool searchThrows;

  @override
  Future<GeoPoint> geocodePlace(String query) async {
    if (geocodeThrows) {
      throw Exception('geocode failed');
    }
    return geocodeResult ?? const GeoPoint(lat: -22.9056, lon: -47.0608);
  }

  @override
  Future<List<PoiResult>> searchPois({
    required GeoPoint center,
    required PoiCategory category,
    required int radiusKm,
  }) async {
    if (searchThrows) {
      throw Exception('search failed');
    }
    return searchResults;
  }
}

class _NoopMapsApi extends MapsApi {
  _NoopMapsApi() : super(_NoopApiClient());

  @override
  Future<RouteSummary> getRoute({
    required GeoPoint origin,
    required GeoPoint destination,
  }) {
    throw UnimplementedError();
  }
}

class _NoopApiClient implements ApiClient {
  @override
  dynamic noSuchMethod(Invocation invocation) => throw UnimplementedError();
}
