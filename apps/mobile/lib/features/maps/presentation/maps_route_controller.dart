import 'package:conecta_geracao/core/network/api_exception.dart';
import 'package:conecta_geracao/features/maps/data/maps_repository.dart';
import 'package:conecta_geracao/features/maps/domain/route_summary.dart';
import 'package:conecta_geracao/features/maps/presentation/maps_providers.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MapsRouteState {
  const MapsRouteState({this.route, this.isLoading = false, this.errorMessage});

  final RouteSummary? route;
  final bool isLoading;
  final String? errorMessage;

  MapsRouteState copyWith({
    RouteSummary? route,
    bool? isLoading,
    String? errorMessage,
    bool clearError = false,
    bool clearRoute = false,
  }) {
    return MapsRouteState(
      route: clearRoute ? null : (route ?? this.route),
      isLoading: isLoading ?? this.isLoading,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

class MapsRouteController
    extends FamilyNotifier<MapsRouteState, MapsRouteArgs> {
  @override
  MapsRouteState build(MapsRouteArgs arg) {
    Future.microtask(loadRoute);
    return const MapsRouteState(isLoading: true);
  }

  MapsRepository get _repository => ref.read(mapsRepositoryProvider);

  Future<void> loadRoute() async {
    state = state.copyWith(isLoading: true, clearError: true, clearRoute: true);

    try {
      final route = await _repository.getRoute(
        origin: arg.origin,
        destination: arg.destination,
      );
      state = state.copyWith(route: route, isLoading: false);
    } on ApiException catch (error) {
      state = state.copyWith(isLoading: false, errorMessage: error.userMessage);
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Não conseguimos traçar o caminho agora. Tente de novo.',
      );
    }
  }
}

final mapsRouteControllerProvider =
    NotifierProvider.family<MapsRouteController, MapsRouteState, MapsRouteArgs>(
      MapsRouteController.new,
    );
