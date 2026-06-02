import 'dart:async';

import 'package:conecta_geracao/features/auth/data/auth_repository.dart';
import 'package:conecta_geracao/features/auth/domain/app_user.dart';
import 'package:flutter/foundation.dart';

class AuthGate extends ChangeNotifier {
  AuthGate(AuthRepository repository) {
    _subscription = repository.authStateChanges().listen((user) {
      _user = user;
      notifyListeners();
    });
  }

  AppUser? _user;
  late final StreamSubscription<AppUser?> _subscription;

  AppUser? get user => _user;

  bool get isAuthenticated => _user != null;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
