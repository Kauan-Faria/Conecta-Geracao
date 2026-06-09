import 'package:conecta_geracao/core/network/api_client.dart';
import 'package:conecta_geracao/core/network/api_envelope.dart';
import 'package:conecta_geracao/features/maps/domain/geo_point.dart';
import 'package:conecta_geracao/features/maps/domain/poi_category.dart';
import 'package:conecta_geracao/features/maps/domain/poi_result.dart';
import 'package:conecta_geracao/features/maps/domain/route_summary.dart';

class MapsApi {
  MapsApi(this._client);

  final ApiClient _client;

  static const _basePath = '/api/v1/maps';

  Future<List<PoiResult>> searchPois({
    required GeoPoint center,
    required PoiCategory category,
    required int radiusKm,
  }) async {
    final json = await _client.post(
      '$_basePath/search',
      body: {
        'lat': center.lat,
        'lon': center.lon,
        'category': category.apiValue,
        'radiusKm': radiusKm,
      },
    );
    final data = unwrapData(json);
    final results = data['results'] as List<dynamic>? ?? const [];
    return results
        .whereType<Map<String, dynamic>>()
        .map(PoiResult.fromJson)
        .toList();
  }

  Future<GeoPoint> geocodePlace(String query) async {
    final json = await _client.post(
      '$_basePath/geocode',
      body: {'query': query},
    );
    final data = unwrapData(json);
    return GeoPoint(
      lat: (data['lat'] as num).toDouble(),
      lon: (data['lon'] as num).toDouble(),
    );
  }

  Future<RouteSummary> getRoute({
    required GeoPoint origin,
    required GeoPoint destination,
  }) async {
    final json = await _client.post(
      '$_basePath/route',
      body: {'origin': origin.toJson(), 'destination': destination.toJson()},
    );
    return RouteSummary.fromJson(unwrapData(json));
  }
}
