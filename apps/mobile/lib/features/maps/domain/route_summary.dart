import 'package:latlong2/latlong.dart';

class RouteSummary {
  const RouteSummary({
    required this.polylinePoints,
    required this.distanceMeters,
    required this.durationSeconds,
  });

  final List<LatLng> polylinePoints;
  final int distanceMeters;
  final int durationSeconds;

  factory RouteSummary.fromJson(Map<String, dynamic> json) {
    final encoded = json['polyline'] as String? ?? '';
    return RouteSummary(
      polylinePoints: decodePolyline(encoded),
      distanceMeters: (json['distanceMeters'] as num?)?.round() ?? 0,
      durationSeconds: (json['durationSeconds'] as num?)?.round() ?? 0,
    );
  }
}

List<LatLng> decodePolyline(String encoded) {
  if (encoded.isEmpty) {
    return const [];
  }

  final points = <LatLng>[];
  var index = 0;
  var lat = 0;
  var lng = 0;

  while (index < encoded.length) {
    var shift = 0;
    var result = 0;
    int byte;
    do {
      byte = encoded.codeUnitAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    final deltaLat = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.codeUnitAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    final deltaLng = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
    lng += deltaLng;

    points.add(LatLng(lat / 1e5, lng / 1e5));
  }

  return points;
}

String formatRouteDistance(int distanceMeters) {
  if (distanceMeters < 1000) {
    return 'cerca de $distanceMeters m';
  }
  final km = distanceMeters / 1000;
  final formatted = km >= 10 ? km.round().toString() : km.toStringAsFixed(1);
  return 'cerca de $formatted km';
}

String formatRouteDuration(int durationSeconds) {
  if (durationSeconds < 60) {
    return 'menos de 1 min a pé';
  }
  final minutes = (durationSeconds / 60).round();
  if (minutes < 60) {
    return '$minutes min a pé';
  }
  final hours = minutes ~/ 60;
  final remaining = minutes % 60;
  if (remaining == 0) {
    return '$hours h a pé';
  }
  return '$hours h e $remaining min a pé';
}
