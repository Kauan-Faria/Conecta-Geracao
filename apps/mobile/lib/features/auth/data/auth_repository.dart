import 'package:conecta_geracao/features/auth/domain/app_user.dart';

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

  Future<void> signOut();

  Future<String?> getIdToken();
}
