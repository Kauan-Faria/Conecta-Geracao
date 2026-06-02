import 'dart:async';

import 'package:conecta_geracao/features/auth/data/guest_history_repository.dart';
import 'package:conecta_geracao/features/auth/data/guest_session_repository.dart';
import 'package:flutter/foundation.dart';

class GuestSessionGate extends ChangeNotifier {
  GuestSessionGate({
    required this.sessionRepository,
    required this.historyRepository,
  }) {
    unawaited(refresh());
  }

  final GuestSessionRepository sessionRepository;
  final GuestHistoryRepository historyRepository;

  bool _isGuestActive = false;

  bool get isGuestActive => _isGuestActive;

  Future<void> refresh() async {
    await sessionRepository.clearIfExpired();
    await historyRepository.clearIfExpired(sessionRepository);
    final active = sessionRepository.isGuestSessionActive();
    if (active != _isGuestActive) {
      _isGuestActive = active;
      notifyListeners();
    }
  }

  Future<void> enterAsGuest() async {
    await sessionRepository.enableGuestSession();
    _isGuestActive = true;
    notifyListeners();
  }

  Future<void> exitGuest() async {
    await sessionRepository.clearGuestSession();
    await historyRepository.saveHistory(const []);
    _isGuestActive = false;
    notifyListeners();
  }
}
