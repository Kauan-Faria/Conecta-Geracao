import 'dart:async';

import 'package:conecta_geracao/core/routing/guest_session_gate.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/data/guest_history_repository.dart';
import 'package:conecta_geracao/features/auth/data/guest_session_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final guestSessionRepositoryProvider = Provider<GuestSessionRepository>((ref) {
  return InMemoryGuestSessionRepository();
});

final guestHistoryRepositoryProvider = Provider<GuestHistoryRepository>((ref) {
  return InMemoryGuestHistoryRepository();
});

final guestSessionGateProvider = Provider<GuestSessionGate>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  unawaited(GuestSessionLegacyCleaner(prefs).clearLegacyGuestData());

  final gate = GuestSessionGate(
    sessionRepository: ref.watch(guestSessionRepositoryProvider),
    historyRepository: ref.watch(guestHistoryRepositoryProvider),
  );
  ref.onDispose(gate.dispose);
  return gate;
});
