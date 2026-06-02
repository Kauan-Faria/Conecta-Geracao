import 'package:conecta_geracao/core/routing/auth_gate.dart';
import 'package:conecta_geracao/core/routing/guest_session_gate.dart';
import 'package:flutter/foundation.dart';

class RouterRefresh extends ChangeNotifier {
  RouterRefresh(AuthGate authGate, GuestSessionGate guestSessionGate) {
    _authGate = authGate;
    _guestSessionGate = guestSessionGate;
    _authGate.addListener(notifyListeners);
    _guestSessionGate.addListener(notifyListeners);
  }

  late final AuthGate _authGate;
  late final GuestSessionGate _guestSessionGate;

  @override
  void dispose() {
    _authGate.removeListener(notifyListeners);
    _guestSessionGate.removeListener(notifyListeners);
    super.dispose();
  }
}
