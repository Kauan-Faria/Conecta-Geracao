import 'package:conecta_geracao/features/maps/data/maps_api.dart';
import 'package:conecta_geracao/features/maps/domain/geo_point.dart';
import 'package:conecta_geracao/features/maps/domain/poi_category.dart';
import 'package:conecta_geracao/features/maps/domain/poi_result.dart';
import 'package:conecta_geracao/features/maps/domain/route_summary.dart';

class MapsRepository {
  MapsRepository(this._api);

  final MapsApi _api;

  Future<List<PoiResult>> searchPois({
    required GeoPoint center,
    required PoiCategory category,
    required int radiusKm,
  }) {
    return _api.searchPois(
      center: center,
      category: category,
      radiusKm: radiusKm,
    );
  }

  Future<GeoPoint> geocodePlace(String query) {
    return _api.geocodePlace(query);
  }

  Future<RouteSummary> getRoute({
    required GeoPoint origin,
    required GeoPoint destination,
  }) {
    return _api.getRoute(origin: origin, destination: destination);
  }
}
