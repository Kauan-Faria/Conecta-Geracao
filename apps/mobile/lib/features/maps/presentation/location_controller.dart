import 'package:conecta_geracao/features/maps/data/maps_repository.dart';
import 'package:conecta_geracao/features/maps/domain/geo_point.dart';
import 'package:conecta_geracao/features/maps/presentation/maps_providers.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

class LocationState {
  const LocationState({
    this.center,
    this.isLoading = false,
    this.permissionDenied = false,
    this.manualPlaceQuery,
    this.errorMessage,
  });

  final GeoPoint? center;
  final bool isLoading;
  final bool permissionDenied;
  final String? manualPlaceQuery;
  final String? errorMessage;

  LocationState copyWith({
    GeoPoint? center,
    bool? isLoading,
    bool? permissionDenied,
    String? manualPlaceQuery,
    String? errorMessage,
    bool clearError = false,
    bool clearCenter = false,
  }) {
    return LocationState(
      center: clearCenter ? null : (center ?? this.center),
      isLoading: isLoading ?? this.isLoading,
      permissionDenied: permissionDenied ?? this.permissionDenied,
      manualPlaceQuery: manualPlaceQuery ?? this.manualPlaceQuery,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

typedef LocationPermissionExplainer = Future<bool> Function();

class LocationController extends Notifier<LocationState> {
  LocationPermissionExplainer? _permissionExplainer;

  @override
  LocationState build() => const LocationState();

  MapsRepository get _repository => ref.read(mapsRepositoryProvider);

  void setPermissionExplainer(LocationPermissionExplainer explainer) {
    _permissionExplainer = explainer;
  }

  Future<GeoPoint?> ensureCenter({GeoPoint? presetCenter}) async {
    if (presetCenter != null) {
      state = state.copyWith(center: presetCenter, clearError: true);
      return presetCenter;
    }

    if (state.center != null) {
      return state.center;
    }

    state = state.copyWith(isLoading: true, clearError: true);

    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        state = state.copyWith(
          isLoading: false,
          permissionDenied: true,
          errorMessage: 'Ative a localização do celular ou informe seu bairro.',
        );
        return null;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        if (_permissionExplainer != null) {
          final proceed = await _permissionExplainer!();
          if (!proceed) {
            state = state.copyWith(
              isLoading: false,
              permissionDenied: true,
              errorMessage: 'Informe seu bairro ou cidade para buscar lugares.',
            );
            return null;
          }
        }
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        state = state.copyWith(
          isLoading: false,
          permissionDenied: true,
          errorMessage: 'Informe seu bairro ou cidade para buscar lugares.',
        );
        return null;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
        ),
      );
      final center = GeoPoint(lat: position.latitude, lon: position.longitude);
      state = state.copyWith(
        center: center,
        isLoading: false,
        permissionDenied: false,
      );
      return center;
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        permissionDenied: true,
        errorMessage:
            'Não conseguimos usar o GPS. Informe seu bairro ou cidade.',
      );
      return null;
    }
  }

  Future<GeoPoint?> geocodeManualPlace(String query) async {
    final trimmed = query.trim();
    if (trimmed.length < 2) {
      state = state.copyWith(
        errorMessage: 'Digite pelo menos 2 letras do bairro ou cidade.',
      );
      return null;
    }

    state = state.copyWith(
      isLoading: true,
      manualPlaceQuery: trimmed,
      clearError: true,
    );

    try {
      final center = await _repository.geocodePlace(trimmed);
      state = state.copyWith(
        center: center,
        isLoading: false,
        permissionDenied: false,
      );
      return center;
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Não encontrei esse lugar. Tente outro bairro.',
      );
      return null;
    }
  }
}

final locationControllerProvider =
    NotifierProvider<LocationController, LocationState>(LocationController.new);
