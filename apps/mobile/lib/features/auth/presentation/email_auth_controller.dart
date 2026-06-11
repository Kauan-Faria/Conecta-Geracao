import 'dart:async';

import 'package:conecta_geracao/core/routing/guest_session_gate.dart';
import 'package:conecta_geracao/features/auth/data/auth_repository.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/guest_session_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum EmailAuthMode { signUp, signIn }

class EmailAuthState {
  const EmailAuthState({
    this.mode = EmailAuthMode.signUp,
    this.isLoading = false,
    this.failedAttempts = 0,
    this.errorMessage,
    this.showForgotPasswordBanner = false,
    this.resetEmailSent = false,
    this.resetEmailAddress,
  });

  final EmailAuthMode mode;
  final bool isLoading;
  final int failedAttempts;
  final String? errorMessage;
  final bool showForgotPasswordBanner;
  final bool resetEmailSent;
  final String? resetEmailAddress;

  bool get shouldShowForgotPasswordBanner =>
      showForgotPasswordBanner || failedAttempts >= 4;

  EmailAuthState copyWith({
    EmailAuthMode? mode,
    bool? isLoading,
    int? failedAttempts,
    String? errorMessage,
    bool? showForgotPasswordBanner,
    bool? resetEmailSent,
    String? resetEmailAddress,
    bool clearError = false,
    bool clearResetConfirmation = false,
  }) {
    return EmailAuthState(
      mode: mode ?? this.mode,
      isLoading: isLoading ?? this.isLoading,
      failedAttempts: failedAttempts ?? this.failedAttempts,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      showForgotPasswordBanner:
          showForgotPasswordBanner ?? this.showForgotPasswordBanner,
      resetEmailSent: clearResetConfirmation
          ? false
          : (resetEmailSent ?? this.resetEmailSent),
      resetEmailAddress: clearResetConfirmation
          ? null
          : (resetEmailAddress ?? this.resetEmailAddress),
    );
  }
}

class EmailAuthController extends Notifier<EmailAuthState> {
  @override
  EmailAuthState build() => const EmailAuthState();

  AuthRepository get _repository => ref.read(authRepositoryProvider);

  GuestSessionGate get _guestGate => ref.read(guestSessionGateProvider);

  void setMode(EmailAuthMode mode) {
    state = EmailAuthState(mode: mode);
  }

  void toggleMode() {
    final nextMode = state.mode == EmailAuthMode.signUp
        ? EmailAuthMode.signIn
        : EmailAuthMode.signUp;
    state = EmailAuthState(mode: nextMode);
  }

  void dismissResetConfirmation() {
    state = state.copyWith(
      clearResetConfirmation: true,
      failedAttempts: 0,
      showForgotPasswordBanner: false,
    );
  }

  Future<bool> submit({
    required String email,
    required String password,
    String? confirmPassword,
  }) async {
    final trimmedEmail = email.trim();
    if (trimmedEmail.isEmpty) {
      state = state.copyWith(errorMessage: 'Digite seu e-mail');
      return false;
    }
    if (password.isEmpty) {
      state = state.copyWith(errorMessage: 'Digite sua senha');
      return false;
    }
    if (state.mode == EmailAuthMode.signUp) {
      if (confirmPassword == null || confirmPassword.isEmpty) {
        state = state.copyWith(errorMessage: 'Confirme sua senha');
        return false;
      }
      if (password != confirmPassword) {
        state = state.copyWith(errorMessage: 'As senhas não coincidem');
        return false;
      }
    }

    state = state.copyWith(isLoading: true, clearError: true);

    try {
      if (state.mode == EmailAuthMode.signUp) {
        await _repository.signUpWithEmailAndPassword(trimmedEmail, password);
      } else {
        await _repository.signInWithEmailAndPassword(trimmedEmail, password);
      }

      await _guestGate.exitGuest();
      state = state.copyWith(
        isLoading: false,
        failedAttempts: 0,
        showForgotPasswordBanner: false,
      );
      return true;
    } on AuthException catch (error) {
      if (state.mode == EmailAuthMode.signIn &&
          error.message == 'E-mail ou senha incorretos') {
        final attempts = state.failedAttempts + 1;
        state = state.copyWith(
          isLoading: false,
          failedAttempts: attempts,
          errorMessage: error.message,
          showForgotPasswordBanner: attempts >= 4,
        );
      } else {
        state = state.copyWith(isLoading: false, errorMessage: error.message);
      }
      return false;
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Não foi possível entrar. Tente novamente.',
      );
      return false;
    }
  }

  Future<bool> sendPasswordReset(String email) async {
    final trimmedEmail = email.trim();
    if (trimmedEmail.isEmpty) {
      state = state.copyWith(errorMessage: 'Digite seu e-mail primeiro');
      return false;
    }

    state = state.copyWith(
      isLoading: true,
      clearError: true,
      clearResetConfirmation: true,
    );

    try {
      await _repository.sendPasswordResetEmail(trimmedEmail);
      state = state.copyWith(
        isLoading: false,
        resetEmailSent: true,
        resetEmailAddress: trimmedEmail,
        failedAttempts: 0,
        showForgotPasswordBanner: false,
      );
      return true;
    } on AuthException catch (error) {
      state = state.copyWith(isLoading: false, errorMessage: error.message);
      return false;
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Não foi possível enviar o e-mail. Tente novamente.',
      );
      return false;
    }
  }
}

final emailAuthControllerProvider =
    NotifierProvider<EmailAuthController, EmailAuthState>(
      EmailAuthController.new,
    );
