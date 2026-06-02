import 'package:conecta_geracao/core/routing/guest_session_gate.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/data/guest_history_repository.dart';
import 'package:conecta_geracao/features/auth/data/guest_session_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final guestSessionRepositoryProvider = Provider<GuestSessionRepository>((ref) {
  return SharedPreferencesGuestSessionRepository(
    ref.watch(sharedPreferencesProvider),
  );
});

final guestHistoryRepositoryProvider = Provider<GuestHistoryRepository>((ref) {
  return SharedPreferencesGuestHistoryRepository(
    ref.watch(sharedPreferencesProvider),
  );
});

final guestSessionGateProvider = Provider<GuestSessionGate>((ref) {
  final gate = GuestSessionGate(
    sessionRepository: ref.watch(guestSessionRepositoryProvider),
    historyRepository: ref.watch(guestHistoryRepositoryProvider),
  );
  ref.onDispose(gate.dispose);
  return gate;
});
