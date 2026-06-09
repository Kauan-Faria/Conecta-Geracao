import 'dart:async';

import 'package:conecta_geracao/features/auth/data/auth_repository.dart';
import 'package:conecta_geracao/features/auth/domain/app_user.dart';
import 'package:conecta_geracao/features/auth/domain/phone_verification_session.dart';

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
  Future<PhoneVerificationSession> startPhoneVerification(
    String e164Phone,
  ) async {
    return PhoneVerificationSession(
      verificationId: 'fake-verification-id',
      e164Phone: e164Phone,
    );
  }

  @override
  Future<AppUser> confirmPhoneOtp({
    required String verificationId,
    required String smsCode,
  }) async {
    _user = const AppUser(
      uid: 'phone-test-uid',
      displayName: null,
      email: null,
    );
    _controller.add(_user);
    return _user!;
  }

  @override
  Future<AppUser> updateDisplayName(String displayName) async {
    _user = AppUser(
      uid: _user?.uid ?? 'test-uid',
      displayName: displayName,
      email: _user?.email,
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
  Future<String?> getIdToken() async => _user == null ? null : 'fake-token';
}

const authenticatedTestUser = AppUser(
  uid: 'test-uid',
  displayName: 'Test User',
  email: 'test@example.com',
);
