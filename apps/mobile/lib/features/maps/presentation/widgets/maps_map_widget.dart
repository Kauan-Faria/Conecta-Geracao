import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class MapsMapWidget extends StatelessWidget {
  const MapsMapWidget({
    required this.mapController,
    this.center,
    this.markers = const [],
    this.polylines = const [],
    this.onMapReady,
    super.key,
  });

  final MapController mapController;
  final LatLng? center;
  final List<Marker> markers;
  final List<Polyline> polylines;
  final VoidCallback? onMapReady;

  static const _defaultCenter = LatLng(-22.9056, -47.0608);

  @override
  Widget build(BuildContext context) {
    final initialCenter = center ?? _defaultCenter;

    return FlutterMap(
      mapController: mapController,
      options: MapOptions(
        initialCenter: initialCenter,
        initialZoom: 14,
        onMapReady: onMapReady,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.conectageracao.app',
        ),
        if (polylines.isNotEmpty) PolylineLayer(polylines: polylines),
        if (markers.isNotEmpty) MarkerLayer(markers: markers),
        RichAttributionWidget(
          attributions: [TextSourceAttribution('© OpenStreetMap contributors')],
        ),
      ],
    );
  }
}
