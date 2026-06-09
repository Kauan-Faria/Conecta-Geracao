import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/maps/data/maps_api.dart';
import 'package:conecta_geracao/features/maps/data/maps_repository.dart';
import 'package:conecta_geracao/features/maps/domain/geo_point.dart';
import 'package:conecta_geracao/features/maps/domain/map_action.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final mapsApiProvider = Provider<MapsApi>((ref) {
  return MapsApi(ref.watch(apiClientProvider));
});

final mapsRepositoryProvider = Provider<MapsRepository>((ref) {
  return MapsRepository(ref.watch(mapsApiProvider));
});

final mapsHandoffProvider = NotifierProvider<MapsHandoffNotifier, MapAction?>(
  MapsHandoffNotifier.new,
);

class MapsHandoffNotifier extends Notifier<MapAction?> {
  @override
  MapAction? build() => null;

  void setHandoff(MapAction action) {
    state = action;
  }

  MapAction? takeHandoff() {
    final action = state;
    state = null;
    return action;
  }
}

class MapsRouteArgs {
  const MapsRouteArgs({
    required this.origin,
    required this.destination,
    required this.destinationName,
  });

  final GeoPoint origin;
  final GeoPoint destination;
  final String destinationName;
}
