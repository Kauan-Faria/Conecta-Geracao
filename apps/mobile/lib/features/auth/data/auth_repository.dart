import 'package:conecta_geracao/features/auth/domain/app_user.dart';
import 'package:conecta_geracao/features/auth/domain/phone_verification_session.dart';

class AuthException implements Exception {
  const AuthException(this.message, {this.isCancelled = false});

  final String message;
  final bool isCancelled;

  @override
  String toString() => message;
}

abstract class AuthRepository {
  Stream<AppUser?> authStateChanges();

  Future<AppUser?> getCurrentUser();

  Future<AppUser> signInWithGoogle();

  Future<PhoneVerificationSession> startPhoneVerification(String e164Phone);

  Future<AppUser> confirmPhoneOtp({
    required String verificationId,
    required String smsCode,
  });

  Future<AppUser> updateDisplayName(String displayName);

  Future<AppUser> signUpWithEmailAndPassword(String email, String password);

  Future<AppUser> signInWithEmailAndPassword(String email, String password);

  Future<void> sendEmailVerification();

  Future<void> sendPasswordResetEmail(String email);

  Future<AppUser?> reloadCurrentUser();

  Future<bool> isEmailVerified();

  Future<void> signOut();

  Future<String?> getIdToken();
}
