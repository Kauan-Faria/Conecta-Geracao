import 'package:conecta_geracao/features/maps/domain/geo_point.dart';
import 'package:conecta_geracao/features/maps/domain/poi_category.dart';

class MapAction {
  const MapAction({
    required this.category,
    required this.radiusKm,
    this.center,
  });

  final PoiCategory category;
  final int radiusKm;
  final GeoPoint? center;

  factory MapAction.fromJson(Map<String, dynamic> json) {
    final category = PoiCategory.fromApiValue(json['category'] as String?);
    if (category == null) {
      throw FormatException('Invalid map_action category: ${json['category']}');
    }

    final radiusRaw = json['radiusKm'];
    final radiusKm = radiusRaw is num ? radiusRaw.round() : 5;

    GeoPoint? center;
    final centerRaw = json['center'];
    if (centerRaw is Map<String, dynamic>) {
      center = GeoPoint.fromJson(centerRaw);
    }

    return MapAction(
      category: category,
      radiusKm: _normalizeRadius(radiusKm),
      center: center,
    );
  }

  static int _normalizeRadius(int radiusKm) {
    if (radiusKm <= 2) {
      return 2;
    }
    if (radiusKm >= 10) {
      return 10;
    }
    return 5;
  }
}
