import 'dart:async';

import 'package:conecta_geracao/features/auth/data/auth_repository.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class EmailVerificationState {
  const EmailVerificationState({
    this.isLoading = false,
    this.isResending = false,
    this.resendCooldownSeconds = 0,
    this.errorMessage,
    this.infoMessage,
  });

  final bool isLoading;
  final bool isResending;
  final int resendCooldownSeconds;
  final String? errorMessage;
  final String? infoMessage;

  EmailVerificationState copyWith({
    bool? isLoading,
    bool? isResending,
    int? resendCooldownSeconds,
    String? errorMessage,
    String? infoMessage,
    bool clearError = false,
    bool clearInfo = false,
  }) {
    return EmailVerificationState(
      isLoading: isLoading ?? this.isLoading,
      isResending: isResending ?? this.isResending,
      resendCooldownSeconds:
          resendCooldownSeconds ?? this.resendCooldownSeconds,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      infoMessage: clearInfo ? null : (infoMessage ?? this.infoMessage),
    );
  }
}

class EmailVerificationController extends Notifier<EmailVerificationState> {
  Timer? _cooldownTimer;

  @override
  EmailVerificationState build() {
    ref.onDispose(() => _cooldownTimer?.cancel());
    return const EmailVerificationState();
  }

  AuthRepository get _repository => ref.read(authRepositoryProvider);

  Future<bool> checkVerification() async {
    state = state.copyWith(isLoading: true, clearError: true, clearInfo: true);

    try {
      final user = await _repository.reloadCurrentUser();
      state = state.copyWith(isLoading: false);
      if (user?.emailVerified ?? false) {
        return true;
      }
      state = state.copyWith(
        errorMessage:
            'Ainda não confirmamos seu e-mail. Abra o link que enviamos.',
      );
      return false;
    } on AuthException catch (error) {
      state = state.copyWith(isLoading: false, errorMessage: error.message);
      return false;
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Não foi possível verificar seu e-mail. Tente novamente.',
      );
      return false;
    }
  }

  Future<bool> resendVerificationEmail() async {
    if (state.resendCooldownSeconds > 0) {
      return false;
    }

    state = state.copyWith(
      isResending: true,
      clearError: true,
      clearInfo: true,
    );

    try {
      await _repository.sendEmailVerification();
      state = state.copyWith(
        isResending: false,
        resendCooldownSeconds: 60,
        infoMessage:
            'Enviamos um novo e-mail. Verifique também a caixa de spam.',
      );
      _startCooldown();
      return true;
    } on AuthException catch (error) {
      state = state.copyWith(isResending: false, errorMessage: error.message);
      return false;
    } catch (_) {
      state = state.copyWith(
        isResending: false,
        errorMessage: 'Não foi possível enviar o e-mail. Tente novamente.',
      );
      return false;
    }
  }

  void _startCooldown() {
    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      final next = state.resendCooldownSeconds - 1;
      if (next <= 0) {
        timer.cancel();
        state = state.copyWith(resendCooldownSeconds: 0);
      } else {
        state = state.copyWith(resendCooldownSeconds: next);
      }
    });
  }
}

final emailVerificationControllerProvider =
    NotifierProvider<EmailVerificationController, EmailVerificationState>(
      EmailVerificationController.new,
    );
