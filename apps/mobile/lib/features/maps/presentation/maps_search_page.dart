import 'package:conecta_geracao/core/theme/app_colors.dart';
import 'package:conecta_geracao/core/theme/app_spacing.dart';
import 'package:conecta_geracao/core/widgets/app_button.dart';
import 'package:conecta_geracao/core/widgets/app_scaffold.dart';
import 'package:conecta_geracao/features/maps/domain/distance_formatter.dart';
import 'package:conecta_geracao/features/maps/domain/poi_category.dart';
import 'package:conecta_geracao/features/maps/domain/poi_result.dart';
import 'package:conecta_geracao/features/maps/presentation/location_controller.dart';
import 'package:conecta_geracao/features/maps/presentation/maps_providers.dart';
import 'package:conecta_geracao/features/maps/presentation/maps_search_controller.dart';
import 'package:conecta_geracao/features/maps/presentation/widgets/maps_ai_assist_button.dart';
import 'package:conecta_geracao/features/maps/presentation/widgets/maps_category_button.dart';
import 'package:conecta_geracao/features/maps/presentation/widgets/maps_map_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';

class MapsSearchPage extends ConsumerStatefulWidget {
  const MapsSearchPage({this.initialCategory, this.initialRadiusKm, super.key});

  final PoiCategory? initialCategory;
  final int? initialRadiusKm;

  @override
  ConsumerState<MapsSearchPage> createState() => _MapsSearchPageState();
}

class _MapsSearchPageState extends ConsumerState<MapsSearchPage> {
  final _mapController = MapController();
  final _manualPlaceController = TextEditingController();
  bool _initialized = false;

  @override
  void dispose() {
    _mapController.dispose();
    _manualPlaceController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _initialize());
  }

  Future<bool> _showLocationPermissionDialog() async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          title: const Text('Usar sua localização?'),
          content: const Text(
            'Precisamos da sua localização para mostrar farmácias, UBS e '
            'outros lugares perto de você. Você também pode informar seu '
            'bairro ou cidade.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Informar bairro'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Permitir'),
            ),
          ],
        );
      },
    );

    return result ?? false;
  }

  Future<void> _initialize() async {
    if (_initialized) {
      return;
    }
    _initialized = true;

    ref
        .read(locationControllerProvider.notifier)
        .setPermissionExplainer(_showLocationPermissionDialog);

    final search = ref.read(mapsSearchControllerProvider.notifier);
    if (widget.initialCategory != null) {
      search.selectCategory(widget.initialCategory!);
    }
    if (widget.initialRadiusKm != null) {
      search.selectRadius(widget.initialRadiusKm!);
    }

    final handoff = ref.read(mapsHandoffProvider.notifier).takeHandoff();
    if (handoff != null) {
      await search.applyHandoff(handoff);
      return;
    }

    await ref.read(locationControllerProvider.notifier).ensureCenter();
  }

  Future<void> _submitManualPlace() async {
    final center = await ref
        .read(locationControllerProvider.notifier)
        .geocodeManualPlace(_manualPlaceController.text);
    if (center != null && mounted) {
      ref.read(mapsSearchControllerProvider.notifier).search();
    }
  }

  void _openRoute(PoiResult poi) {
    ref.read(mapsSearchControllerProvider.notifier).selectPoi(poi);

    final searchState = ref.read(mapsSearchControllerProvider);
    final center =
        searchState.center ?? ref.read(locationControllerProvider).center;
    if (center == null) {
      return;
    }

    context.push(
      '/maps/route',
      extra: MapsRouteArgs(
        origin: center,
        destination: poi.location,
        destinationName: poi.name,
      ),
    );
  }

  String _poiSemanticLabel(PoiResult poi) {
    final distance = formatPoiDistance(poi.distanceMeters);
    if (poi.address.isEmpty) {
      return '${poi.name}, $distance';
    }
    return '${poi.name}, ${poi.address}, $distance';
  }

  String _poiSubtitle(PoiResult poi) {
    final distance = formatPoiDistance(poi.distanceMeters);
    if (poi.address.isEmpty) {
      return distance;
    }
    return '${poi.address}\n$distance';
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(mapsSearchControllerProvider);
    final locationState = ref.watch(locationControllerProvider);
    final theme = Theme.of(context);
    final mapCenter = locationState.center ?? searchState.center;
    final latLngCenter = mapCenter == null
        ? null
        : LatLng(mapCenter.lat, mapCenter.lon);

    ref.listen(mapsHandoffProvider, (previous, next) async {
      if (next != null) {
        await ref
            .read(mapsSearchControllerProvider.notifier)
            .applyHandoff(next);
        ref.read(mapsHandoffProvider.notifier).takeHandoff();
      }
    });

    return AppScaffold(
      title: 'Mapas',
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            height: 180,
            child: MapsMapWidget(
              mapController: _mapController,
              center: latLngCenter,
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(AppSpacing.md),
              children: [
                Text(
                  'O que você procura por perto?',
                  style: theme.textTheme.titleMedium,
                ),
                SizedBox(height: AppSpacing.sm),
                Wrap(
                  spacing: AppSpacing.sm,
                  runSpacing: AppSpacing.sm,
                  children: PoiCategory.values.map((category) {
                    return MapsCategoryButton(
                      category: category,
                      selected: searchState.category == category,
                      onSelected: () {
                        ref
                            .read(mapsSearchControllerProvider.notifier)
                            .selectCategory(category);
                      },
                    );
                  }).toList(),
                ),
                SizedBox(height: AppSpacing.md),
                Text('Raio da busca', style: theme.textTheme.titleSmall),
                SizedBox(height: AppSpacing.xs),
                Semantics(
                  label: 'Raio da busca em quilômetros',
                  child: SegmentedButton<int>(
                    segments: const [
                      ButtonSegment(
                        value: 2,
                        label: Text('2 km'),
                        tooltip: 'Buscar em um raio de 2 quilômetros',
                      ),
                      ButtonSegment(
                        value: 5,
                        label: Text('5 km'),
                        tooltip: 'Buscar em um raio de 5 quilômetros',
                      ),
                      ButtonSegment(
                        value: 10,
                        label: Text('10 km'),
                        tooltip: 'Buscar em um raio de 10 quilômetros',
                      ),
                    ],
                    selected: {searchState.radiusKm},
                    onSelectionChanged: (selection) {
                      ref
                          .read(mapsSearchControllerProvider.notifier)
                          .selectRadius(selection.first);
                    },
                  ),
                ),
                SizedBox(height: AppSpacing.md),
                if (locationState.isLoading)
                  const Center(child: CircularProgressIndicator())
                else if (locationState.permissionDenied) ...[
                  Text(
                    locationState.errorMessage ??
                        'Em qual bairro ou cidade você está?',
                    style: theme.textTheme.bodyMedium,
                  ),
                  SizedBox(height: AppSpacing.sm),
                  TextField(
                    controller: _manualPlaceController,
                    decoration: const InputDecoration(
                      labelText: 'Bairro ou cidade',
                      hintText: 'Ex.: Centro, Campinas',
                    ),
                    textInputAction: TextInputAction.search,
                    onSubmitted: (_) => _submitManualPlace(),
                  ),
                  SizedBox(height: AppSpacing.sm),
                  AppButton(
                    label: 'Usar este lugar',
                    semanticLabel: 'Usar bairro ou cidade informado',
                    onPressed: _submitManualPlace,
                  ),
                ] else if (mapCenter != null)
                  Text(
                    'Buscando perto da sua localização.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: AppColors.onSurfaceVariant,
                    ),
                  ),
                SizedBox(height: AppSpacing.md),
                AppButton(
                  label: searchState.isSearching
                      ? 'Buscando...'
                      : 'Buscar lugares',
                  semanticLabel: 'Buscar lugares próximos',
                  onPressed: searchState.isSearching
                      ? null
                      : () {
                          ref
                              .read(mapsSearchControllerProvider.notifier)
                              .search();
                        },
                ),
                SizedBox(height: AppSpacing.sm),
                MapsAiAssistButton(selectedCategory: searchState.category),
                if (searchState.errorMessage != null) ...[
                  SizedBox(height: AppSpacing.md),
                  Text(
                    searchState.errorMessage!,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: AppColors.error,
                    ),
                  ),
                ],
                if (searchState.results.isNotEmpty) ...[
                  SizedBox(height: AppSpacing.lg),
                  Text('Resultados', style: theme.textTheme.titleMedium),
                  SizedBox(height: AppSpacing.sm),
                  ...searchState.results.map(
                    (poi) => Semantics(
                      button: true,
                      label: _poiSemanticLabel(poi),
                      child: Card(
                        child: ListTile(
                          title: Text(poi.name),
                          subtitle: Text(_poiSubtitle(poi)),
                          trailing: const Icon(Icons.directions_walk),
                          onTap: () => _openRoute(poi),
                        ),
                      ),
                    ),
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
