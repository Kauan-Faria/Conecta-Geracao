String formatPoiDistance(int distanceMeters) {
  if (distanceMeters < 1000) {
    return 'a $distanceMeters metros';
  }

  final km = distanceMeters / 1000;
  if (km >= 10) {
    return 'a ${km.round()} km';
  }

  if (km == km.roundToDouble()) {
    return 'a ${km.toInt()} km';
  }

  final formatted = km.toStringAsFixed(1).replaceAll('.', ',');
  return 'a $formatted km';
}
