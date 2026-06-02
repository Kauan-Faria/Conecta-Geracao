import 'dart:async';

import 'package:conecta_geracao/features/auth/data/auth_repository.dart';
import 'package:conecta_geracao/features/auth/domain/app_user.dart';

class FakeAuthRepository implements AuthRepository {
  FakeAuthRepository({AppUser? initialUser}) {
    _user = initialUser;
    _controller.add(initialUser);
  }

  AppUser? _user;
  final StreamController<AppUser?> _controller = StreamController.broadcast();

  @override
  Stream<AppUser?> authStateChanges() {
    return Stream.multi((controller) {
      controller.add(_user);
      final subscription = _controller.stream.listen(
        controller.add,
        onError: controller.addError,
        onDone: controller.close,
      );
      controller.onCancel = subscription.cancel;
    });
  }

  @override
  Future<AppUser?> getCurrentUser() async => _user;

  @override
  Future<AppUser> signInWithGoogle() async {
    _user = const AppUser(
      uid: 'test-uid',
      displayName: 'Test User',
      email: 'test@example.com',
    );
    _controller.add(_user);
    return _user!;
  }

  @override
  Future<void> signOut() async {
    _user = null;
    _controller.add(null);
  }

  @override
  Future<String?> getIdToken() async => 'fake-token';
}

const authenticatedTestUser = AppUser(
  uid: 'test-uid',
  displayName: 'Test User',
  email: 'test@example.com',
);
