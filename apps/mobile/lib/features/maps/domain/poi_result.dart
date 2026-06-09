import 'package:conecta_geracao/features/maps/domain/geo_point.dart';

class PoiResult {
  const PoiResult({
    required this.osmId,
    required this.name,
    required this.address,
    required this.lat,
    required this.lon,
    required this.distanceMeters,
  });

  final String osmId;
  final String name;
  final String address;
  final double lat;
  final double lon;
  final int distanceMeters;

  GeoPoint get location => GeoPoint(lat: lat, lon: lon);

  factory PoiResult.fromJson(Map<String, dynamic> json) {
    return PoiResult(
      osmId: json['osmId'] as String,
      name: json['name'] as String,
      address: json['address'] as String? ?? '',
      lat: (json['lat'] as num).toDouble(),
      lon: (json['lon'] as num).toDouble(),
      distanceMeters: (json['distanceMeters'] as num).round(),
    );
  }
}
