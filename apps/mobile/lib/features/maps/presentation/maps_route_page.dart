import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:conecta_geracao/core/widgets/app_scaffold.dart';
import 'package:conecta_geracao/features/maps/domain/route_summary.dart';
import 'package:conecta_geracao/features/maps/presentation/maps_providers.dart';
import 'package:conecta_geracao/features/maps/presentation/maps_route_controller.dart';
import 'package:conecta_geracao/features/maps/presentation/widgets/maps_map_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';

class MapsRoutePage extends ConsumerStatefulWidget {
  const MapsRoutePage({required this.args, super.key});

  final MapsRouteArgs args;

  @override
  ConsumerState<MapsRoutePage> createState() => _MapsRoutePageState();
}

class _MapsRoutePageState extends ConsumerState<MapsRoutePage> {
  final _mapController = MapController();

  @override
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }

  void _fitRoute(List<LatLng> points) {
    if (points.isEmpty) {
      return;
    }
    final bounds = LatLngBounds.fromPoints(points);
    _mapController.fitCamera(
      CameraFit.bounds(bounds: bounds, padding: const EdgeInsets.all(48)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final routeState = ref.watch(mapsRouteControllerProvider(widget.args));
    final theme = Theme.of(context);
    final origin = LatLng(widget.args.origin.lat, widget.args.origin.lon);
    final destination = LatLng(
      widget.args.destination.lat,
      widget.args.destination.lon,
    );

    final routePoints = routeState.route?.polylinePoints ?? const <LatLng>[];
    final allPoints = [origin, destination, ...routePoints];

    return AppScaffold(
      title: widget.args.destinationName,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: Stack(
              children: [
                MapsMapWidget(
                  mapController: _mapController,
                  center: origin,
                  markers: [
                    Marker(
                      point: origin,
                      width: 40,
                      height: 40,
                      child: const Icon(
                        Icons.person_pin_circle,
                        color: AppColors.primary,
                        size: 40,
                      ),
                    ),
                    Marker(
                      point: destination,
                      width: 40,
                      height: 40,
                      child: const Icon(
                        Icons.place,
                        color: AppColors.error,
                        size: 40,
                      ),
                    ),
                  ],
                  polylines: routePoints.isEmpty
                      ? const []
                      : [
                          Polyline(
                            points: routePoints,
                            color: AppColors.primary,
                            strokeWidth: 4,
                          ),
                        ],
                  onMapReady: () {
                    if (routePoints.isNotEmpty) {
                      _fitRoute(allPoints);
                    }
                  },
                ),
                if (routeState.isLoading)
                  const Center(child: CircularProgressIndicator()),
                Positioned(
                  right: AppSpacing.md,
                  bottom: AppSpacing.md,
                  child: Semantics(
                    button: true,
                    label: 'Centralizar mapa na rota',
                    child: SizedBox(
                      width: 48,
                      height: 48,
                      child: FloatingActionButton(
                        onPressed: routePoints.isEmpty
                            ? null
                            : () => _fitRoute(allPoints),
                        child: const Icon(Icons.center_focus_strong),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (routeState.route != null) ...[
                  Text(
                    '${formatRouteDistance(routeState.route!.distanceMeters)} — '
                    '${formatRouteDuration(routeState.route!.durationSeconds)}',
                    style: theme.textTheme.titleMedium,
                  ),
                  SizedBox(height: AppSpacing.sm),
                  Text(
                    'Este caminho é uma sugestão. Observe placas e faixas de pedestre.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: AppColors.onSurfaceVariant,
                    ),
                  ),
                ] else if (routeState.errorMessage != null) ...[
                  Text(
                    routeState.errorMessage!,
                    style: theme.textTheme.bodyLarge,
                  ),
                  SizedBox(height: AppSpacing.md),
                  AppButton(
                    label: 'Tentar de novo',
                    semanticLabel: 'Tentar calcular a rota novamente',
                    onPressed: () {
                      ref
                          .read(
                            mapsRouteControllerProvider(widget.args).notifier,
                          )
                          .loadRoute();
                    },
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
