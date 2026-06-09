import 'dart:async';

import 'package:conecta_geracao/features/auth/data/auth_repository.dart';
import 'package:conecta_geracao/features/auth/domain/app_user.dart';
import 'package:conecta_geracao/features/auth/domain/phone_verification_session.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/services.dart';
import 'package:google_sign_in/google_sign_in.dart';

const autoVerifiedPhoneVerificationId = '__auto_verified__';

class FirebaseAuthRepository implements AuthRepository {
  FirebaseAuthRepository({
    FirebaseAuth? firebaseAuth,
    GoogleSignIn? googleSignIn,
  }) : _firebaseAuth = firebaseAuth ?? FirebaseAuth.instance,
       _googleSignIn = googleSignIn ?? GoogleSignIn();

  final FirebaseAuth _firebaseAuth;
  final GoogleSignIn _googleSignIn;

  @override
  Stream<AppUser?> authStateChanges() {
    return _firebaseAuth.authStateChanges().map(_mapUser);
  }

  @override
  Future<AppUser?> getCurrentUser() async {
    return _mapUser(_firebaseAuth.currentUser);
  }

  @override
  Future<AppUser> signInWithGoogle() async {
    try {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        throw const AuthException('Login cancelado.', isCancelled: true);
      }

      final googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _firebaseAuth.signInWithCredential(
        credential,
      );
      final user = _mapUser(userCredential.user);
      if (user == null) {
        throw const AuthException('Não foi possível entrar. Tente novamente.');
      }
      return user;
    } on AuthException {
      rethrow;
    } on FirebaseAuthException catch (error) {
      throw AuthException(_mapFirebaseError(error));
    } on PlatformException catch (error) {
      if (_isCancelled(error)) {
        throw const AuthException('Login cancelado.', isCancelled: true);
      }
      if (_isNetworkError(error)) {
        throw const AuthException('Precisa de internet para entrar.');
      }
      throw AuthException('Não foi possível entrar. Tente novamente.');
    } catch (_) {
      throw const AuthException('Não foi possível entrar. Tente novamente.');
    }
  }

  @override
  Future<PhoneVerificationSession> startPhoneVerification(
    String e164Phone,
  ) async {
    final completer = Completer<PhoneVerificationSession>();

    try {
      await _firebaseAuth.verifyPhoneNumber(
        phoneNumber: e164Phone,
        timeout: const Duration(seconds: 120),
        verificationCompleted: (PhoneAuthCredential credential) async {
          try {
            await _firebaseAuth.signInWithCredential(credential);
            if (!completer.isCompleted) {
              completer.complete(
                PhoneVerificationSession(
                  verificationId: autoVerifiedPhoneVerificationId,
                  e164Phone: e164Phone,
                ),
              );
            }
          } on FirebaseAuthException catch (error) {
            if (!completer.isCompleted) {
              completer.completeError(AuthException(_mapPhoneError(error)));
            }
          } catch (_) {
            if (!completer.isCompleted) {
              completer.completeError(
                const AuthException(
                  'Não foi possível entrar. Tente novamente.',
                ),
              );
            }
          }
        },
        verificationFailed: (FirebaseAuthException error) {
          if (!completer.isCompleted) {
            completer.completeError(AuthException(_mapPhoneError(error)));
          }
        },
        codeSent: (verificationId, resendToken) {
          if (!completer.isCompleted) {
            completer.complete(
              PhoneVerificationSession(
                verificationId: verificationId,
                e164Phone: e164Phone,
                resendToken: resendToken,
              ),
            );
          }
        },
        codeAutoRetrievalTimeout: (_) {},
      );
    } on AuthException {
      rethrow;
    } catch (_) {
      throw const AuthException(
        'Não foi possível enviar o código. Tente novamente.',
      );
    }

    return completer.future.timeout(
      const Duration(seconds: 120),
      onTimeout: () => throw const AuthException(
        'Demorou para enviar o código. Verifique o número e tente de novo.',
      ),
    );
  }

  @override
  Future<AppUser> confirmPhoneOtp({
    required String verificationId,
    required String smsCode,
  }) async {
    if (verificationId == autoVerifiedPhoneVerificationId) {
      final user = _mapUser(_firebaseAuth.currentUser);
      if (user != null) {
        return user;
      }
      throw const AuthException('Não foi possível entrar. Tente novamente.');
    }

    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: smsCode.trim(),
      );
      final userCredential = await _firebaseAuth.signInWithCredential(
        credential,
      );
      final user = _mapUser(userCredential.user);
      if (user == null) {
        throw const AuthException('Não foi possível entrar. Tente novamente.');
      }
      return user;
    } on AuthException {
      rethrow;
    } on FirebaseAuthException catch (error) {
      throw AuthException(_mapPhoneError(error));
    } catch (_) {
      throw const AuthException('Código errado. Tente de novo.');
    }
  }

  @override
  Future<AppUser> updateDisplayName(String displayName) async {
    final trimmed = displayName.trim();
    if (trimmed.length < 2) {
      throw const AuthException('Escreva como quer ser chamado');
    }

    final firebaseUser = _firebaseAuth.currentUser;
    if (firebaseUser == null) {
      throw const AuthException('Sessão expirada. Entre novamente.');
    }

    try {
      await firebaseUser.updateDisplayName(trimmed);
      await firebaseUser.reload();
      final user = _mapUser(_firebaseAuth.currentUser);
      if (user == null) {
        throw const AuthException('Não foi possível salvar seu nome.');
      }
      return user;
    } on FirebaseAuthException catch (error) {
      throw AuthException(_mapFirebaseError(error));
    } catch (_) {
      throw const AuthException('Não foi possível salvar seu nome.');
    }
  }

  @override
  Future<void> signOut() async {
    await Future.wait([_firebaseAuth.signOut(), _googleSignIn.signOut()]);
  }

  @override
  Future<String?> getIdToken() async {
    return _firebaseAuth.currentUser?.getIdToken();
  }

  AppUser? _mapUser(User? user) {
    if (user == null) {
      return null;
    }
    return AppUser(
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
    );
  }

  String _mapPhoneError(FirebaseAuthException error) {
    switch (error.code) {
      case 'invalid-phone-number':
        return 'Número incompleto ou inválido.';
      case 'invalid-verification-code':
      case 'invalid-verification-id':
        return 'Código errado. Tente de novo.';
      case 'session-expired':
        return 'O código expirou. Peça um código novo.';
      case 'network-request-failed':
        return 'Precisa de internet para entrar.';
      case 'too-many-requests':
        return 'Muitas tentativas. Aguarde um momento.';
      default:
        return _mapFirebaseError(error);
    }
  }

  String _mapFirebaseError(FirebaseAuthException error) {
    switch (error.code) {
      case 'network-request-failed':
        return 'Precisa de internet para entrar.';
      case 'user-disabled':
        return 'Esta conta está desativada.';
      case 'too-many-requests':
        return 'Muitas tentativas. Aguarde um momento.';
      default:
        return 'Não foi possível entrar. Tente novamente.';
    }
  }

  bool _isCancelled(PlatformException error) {
    final code = error.code.toLowerCase();
    return code.contains('cancel') || code.contains('sign_in_canceled');
  }

  bool _isNetworkError(PlatformException error) {
    final code = error.code.toLowerCase();
    final message = (error.message ?? '').toLowerCase();
    return code.contains('network') || message.contains('network');
  }
}
