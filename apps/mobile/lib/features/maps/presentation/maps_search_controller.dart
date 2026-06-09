import 'package:conecta_geracao/core/network/api_exception.dart';
import 'package:conecta_geracao/features/maps/data/maps_repository.dart';
import 'package:conecta_geracao/features/maps/domain/geo_point.dart';
import 'package:conecta_geracao/features/maps/domain/map_action.dart';
import 'package:conecta_geracao/features/maps/domain/poi_category.dart';
import 'package:conecta_geracao/features/maps/domain/poi_result.dart';
import 'package:conecta_geracao/features/maps/presentation/location_controller.dart';
import 'package:conecta_geracao/features/maps/presentation/maps_providers.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MapsSearchState {
  const MapsSearchState({
    this.category,
    this.radiusKm = 5,
    this.center,
    this.results = const [],
    this.selectedPoi,
    this.isSearching = false,
    this.errorMessage,
    this.handoffApplied = false,
  });

  final PoiCategory? category;
  final int radiusKm;
  final GeoPoint? center;
  final List<PoiResult> results;
  final PoiResult? selectedPoi;
  final bool isSearching;
  final String? errorMessage;
  final bool handoffApplied;

  MapsSearchState copyWith({
    PoiCategory? category,
    int? radiusKm,
    GeoPoint? center,
    List<PoiResult>? results,
    PoiResult? selectedPoi,
    bool? isSearching,
    String? errorMessage,
    bool clearError = false,
    bool? handoffApplied,
    bool clearResults = false,
  }) {
    return MapsSearchState(
      category: category ?? this.category,
      radiusKm: radiusKm ?? this.radiusKm,
      center: center ?? this.center,
      results: clearResults ? const [] : (results ?? this.results),
      selectedPoi: selectedPoi ?? this.selectedPoi,
      isSearching: isSearching ?? this.isSearching,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      handoffApplied: handoffApplied ?? this.handoffApplied,
    );
  }
}

class MapsSearchController extends Notifier<MapsSearchState> {
  @override
  MapsSearchState build() => const MapsSearchState();

  MapsRepository get _repository => ref.read(mapsRepositoryProvider);

  LocationController get _location =>
      ref.read(locationControllerProvider.notifier);

  void selectCategory(PoiCategory category) {
    state = state.copyWith(category: category, clearError: true);
  }

  void selectRadius(int radiusKm) {
    state = state.copyWith(radiusKm: radiusKm, clearError: true);
  }

  void applySuggestion({PoiCategory? category, int? radiusKm}) {
    state = state.copyWith(
      category: category ?? state.category,
      radiusKm: radiusKm ?? state.radiusKm,
      clearError: true,
    );
  }

  Future<void> applyHandoff(MapAction action) async {
    state = state.copyWith(
      category: action.category,
      radiusKm: action.radiusKm,
      center: action.center,
      handoffApplied: true,
      clearResults: true,
      clearError: true,
    );

    final center = await _location.ensureCenter(presetCenter: action.center);
    if (center != null) {
      state = state.copyWith(center: center);
      await search();
    }
  }

  Future<void> search() async {
    final category = state.category;
    if (category == null) {
      state = state.copyWith(
        errorMessage: 'Escolha o tipo de lugar que você procura.',
      );
      return;
    }

    state = state.copyWith(
      isSearching: true,
      clearError: true,
      clearResults: true,
    );

    try {
      var center = state.center ?? ref.read(locationControllerProvider).center;
      center ??= await _location.ensureCenter();
      if (center == null) {
        state = state.copyWith(isSearching: false);
        return;
      }

      final results = await _repository.searchPois(
        center: center,
        category: category,
        radiusKm: state.radiusKm,
      );

      state = state.copyWith(
        center: center,
        results: results,
        isSearching: false,
        errorMessage: results.isEmpty
            ? 'Não encontrei nenhum lugar por perto. Tente aumentar a distância.'
            : null,
      );
    } on ApiException catch (error) {
      state = state.copyWith(
        isSearching: false,
        errorMessage: error.userMessage,
      );
    } catch (_) {
      state = state.copyWith(
        isSearching: false,
        errorMessage: 'Não foi possível buscar agora. Tente de novo.',
      );
    }
  }

  void selectPoi(PoiResult poi) {
    state = state.copyWith(selectedPoi: poi);
  }
}

final mapsSearchControllerProvider =
    NotifierProvider<MapsSearchController, MapsSearchState>(
      MapsSearchController.new,
    );
