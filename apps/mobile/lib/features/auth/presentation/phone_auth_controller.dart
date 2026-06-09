import 'dart:async';

import 'package:conecta_geracao/core/routing/guest_session_gate.dart';
import 'package:conecta_geracao/features/auth/data/auth_repository.dart';
import 'package:conecta_geracao/features/auth/data/firebase_auth_repository.dart';
import 'package:conecta_geracao/features/auth/domain/brazil_phone_formatter.dart';
import 'package:conecta_geracao/features/auth/domain/phone_verification_session.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/guest_session_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PhoneAuthState {
  const PhoneAuthState({
    this.session,
    this.resendCooldownSeconds = 0,
    this.isSendingCode = false,
    this.isVerifying = false,
    this.errorMessage,
  });

  final PhoneVerificationSession? session;
  final int resendCooldownSeconds;
  final bool isSendingCode;
  final bool isVerifying;
  final String? errorMessage;

  PhoneAuthState copyWith({
    PhoneVerificationSession? session,
    int? resendCooldownSeconds,
    bool? isSendingCode,
    bool? isVerifying,
    String? errorMessage,
    bool clearError = false,
    bool clearSession = false,
  }) {
    return PhoneAuthState(
      session: clearSession ? null : (session ?? this.session),
      resendCooldownSeconds:
          resendCooldownSeconds ?? this.resendCooldownSeconds,
      isSendingCode: isSendingCode ?? this.isSendingCode,
      isVerifying: isVerifying ?? this.isVerifying,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

class PhoneAuthController extends Notifier<PhoneAuthState> {
  Timer? _cooldownTimer;

  @override
  PhoneAuthState build() {
    ref.onDispose(() => _cooldownTimer?.cancel());
    return const PhoneAuthState();
  }

  AuthRepository get _repository => ref.read(authRepositoryProvider);

  GuestSessionGate get _guestGate => ref.read(guestSessionGateProvider);

  Future<bool> sendCode(String rawPhone) async {
    final e164 = BrazilPhoneFormatter.toE164(rawPhone);
    if (e164 == null) {
      state = state.copyWith(errorMessage: 'Número incompleto');
      return false;
    }

    state = state.copyWith(isSendingCode: true, clearError: true);

    try {
      final session = await _repository.startPhoneVerification(e164);
      state = state.copyWith(
        session: session,
        isSendingCode: false,
        resendCooldownSeconds: 60,
      );
      _startCooldown();

      if (session.verificationId == autoVerifiedPhoneVerificationId) {
        await _guestGate.exitGuest();
        return true;
      }

      return true;
    } on AuthException catch (error) {
      state = state.copyWith(isSendingCode: false, errorMessage: error.message);
      return false;
    } catch (_) {
      state = state.copyWith(
        isSendingCode: false,
        errorMessage: 'Não foi possível enviar o código. Tente novamente.',
      );
      return false;
    }
  }

  Future<bool> resendCode(String rawPhone) async {
    if (state.resendCooldownSeconds > 0) {
      return false;
    }
    return sendCode(rawPhone);
  }

  Future<bool> confirmOtp(String smsCode) async {
    final session = state.session;
    if (session == null) {
      state = state.copyWith(errorMessage: 'Peça um código primeiro.');
      return false;
    }

    if (session.verificationId == autoVerifiedPhoneVerificationId) {
      await _guestGate.exitGuest();
      return true;
    }

    if (smsCode.trim().length != 6) {
      state = state.copyWith(errorMessage: 'Digite os 6 números do código.');
      return false;
    }

    state = state.copyWith(isVerifying: true, clearError: true);

    try {
      await _repository.confirmPhoneOtp(
        verificationId: session.verificationId,
        smsCode: smsCode,
      );
      await _guestGate.exitGuest();
      state = state.copyWith(isVerifying: false);
      return true;
    } on AuthException catch (error) {
      state = state.copyWith(isVerifying: false, errorMessage: error.message);
      return false;
    } catch (_) {
      state = state.copyWith(
        isVerifying: false,
        errorMessage: 'Código errado. Tente de novo.',
      );
      return false;
    }
  }

  void reset() {
    _cooldownTimer?.cancel();
    state = const PhoneAuthState();
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

final phoneAuthControllerProvider =
    NotifierProvider<PhoneAuthController, PhoneAuthState>(
      PhoneAuthController.new,
    );
