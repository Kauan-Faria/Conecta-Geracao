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
  bool signUpShouldFail = false;
  bool signInShouldFail = false;
  bool emailVerifiedAfterReload = false;

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
      emailVerified: _user?.emailVerified ?? true,
    );
    _controller.add(_user);
    return _user!;
  }

  @override
  Future<AppUser> signUpWithEmailAndPassword(
    String email,
    String password,
  ) async {
    if (signUpShouldFail) {
      throw const AuthException('Este e-mail já está em uso');
    }
    _user = AppUser(
      uid: 'email-signup-uid',
      displayName: null,
      email: email,
      emailVerified: false,
    );
    _controller.add(_user);
    return _user!;
  }

  @override
  Future<AppUser> signInWithEmailAndPassword(
    String email,
    String password,
  ) async {
    if (signInShouldFail) {
      throw const AuthException('E-mail ou senha incorretos');
    }
    _user = AppUser(
      uid: 'email-signin-uid',
      displayName: null,
      email: email,
      emailVerified: emailVerifiedAfterReload,
    );
    _controller.add(_user);
    return _user!;
  }

  @override
  Future<void> sendEmailVerification() async {}

  @override
  Future<void> sendPasswordResetEmail(String email) async {}

  @override
  Future<AppUser?> reloadCurrentUser() async {
    if (_user == null) {
      return null;
    }
    if (emailVerifiedAfterReload) {
      _user = AppUser(
        uid: _user!.uid,
        displayName: _user!.displayName,
        email: _user!.email,
        emailVerified: true,
      );
      _controller.add(_user);
    }
    return _user;
  }

  @override
  Future<bool> isEmailVerified() async => _user?.emailVerified ?? false;

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

const unverifiedEmailTestUser = AppUser(
  uid: 'email-signup-uid',
  displayName: null,
  email: 'user@example.com',
  emailVerified: false,
);
