import 'package:conecta_geracao/core/routing/auth_gate.dart';
import 'package:conecta_geracao/core/routing/router_refresh.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/guest_session_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

export 'package:conecta_geracao/features/auth/presentation/guest_session_controller.dart'
    show guestSessionGateProvider;

final authGateProvider = Provider<AuthGate>((ref) {
  final gate = AuthGate(ref.watch(authRepositoryProvider));
  ref.onDispose(gate.dispose);
  return gate;
});

final routerRefreshProvider = Provider<RouterRefresh>((ref) {
  final refresh = RouterRefresh(
    ref.watch(authGateProvider),
    ref.watch(guestSessionGateProvider),
  );
  ref.onDispose(refresh.dispose);
  return refresh;
});
