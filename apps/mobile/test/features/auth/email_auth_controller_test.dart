import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/email_auth_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_auth_repository.dart';

void main() {
  group('EmailAuthController', () {
    late FakeAuthRepository fakeAuth;
    late ProviderContainer container;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      final sharedPreferences = await SharedPreferences.getInstance();
      fakeAuth = FakeAuthRepository();
      container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(fakeAuth),
          sharedPreferencesProvider.overrideWithValue(sharedPreferences),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    test('toggleMode resets failed attempts', () async {
      final notifier = container.read(emailAuthControllerProvider.notifier);
      notifier.setMode(EmailAuthMode.signIn);
      fakeAuth.signInShouldFail = true;

      await notifier.submit(
        email: 'user@example.com',
        password: 'wrong',
      );
      expect(container.read(emailAuthControllerProvider).failedAttempts, 1);

      notifier.toggleMode();
      expect(container.read(emailAuthControllerProvider).failedAttempts, 0);
      expect(container.read(emailAuthControllerProvider).mode,
          EmailAuthMode.signUp);
    });

    test('increments failed attempts on invalid credentials', () async {
      final notifier = container.read(emailAuthControllerProvider.notifier);
      notifier.setMode(EmailAuthMode.signIn);
      fakeAuth.signInShouldFail = true;

      for (var i = 1; i <= 4; i++) {
        final ok = await notifier.submit(
          email: 'user@example.com',
          password: 'wrong',
        );
        expect(ok, isFalse);
        expect(
          container.read(emailAuthControllerProvider).failedAttempts,
          i,
        );
      }

      expect(
        container.read(emailAuthControllerProvider).shouldShowForgotPasswordBanner,
        isTrue,
      );
    });

    test('resets failed attempts after successful sign in', () async {
      final notifier = container.read(emailAuthControllerProvider.notifier);
      notifier.setMode(EmailAuthMode.signIn);
      fakeAuth.signInShouldFail = true;

      await notifier.submit(email: 'user@example.com', password: 'wrong');
      fakeAuth.signInShouldFail = false;

      final ok = await notifier.submit(
        email: 'user@example.com',
        password: 'correct',
      );
      expect(ok, isTrue);
      expect(container.read(emailAuthControllerProvider).failedAttempts, 0);
    });

    test('validates password confirmation on sign up', () async {
      final notifier = container.read(emailAuthControllerProvider.notifier);

      final ok = await notifier.submit(
        email: 'user@example.com',
        password: '123456',
        confirmPassword: '654321',
      );

      expect(ok, isFalse);
      expect(
        container.read(emailAuthControllerProvider).errorMessage,
        'As senhas não coincidem',
      );
    });

    test('sendPasswordReset requires email', () async {
      final notifier = container.read(emailAuthControllerProvider.notifier);

      final ok = await notifier.sendPasswordReset('');
      expect(ok, isFalse);
      expect(
        container.read(emailAuthControllerProvider).errorMessage,
        'Digite seu e-mail primeiro',
      );
    });

    test('sendPasswordReset clears failed attempts on success', () async {
      final notifier = container.read(emailAuthControllerProvider.notifier);
      notifier.setMode(EmailAuthMode.signIn);
      fakeAuth.signInShouldFail = true;

      await notifier.submit(email: 'user@example.com', password: 'wrong');
      await notifier.submit(email: 'user@example.com', password: 'wrong');
      await notifier.submit(email: 'user@example.com', password: 'wrong');
      await notifier.submit(email: 'user@example.com', password: 'wrong');

      final ok = await notifier.sendPasswordReset('user@example.com');
      expect(ok, isTrue);
      expect(container.read(emailAuthControllerProvider).resetEmailSent, isTrue);
      expect(container.read(emailAuthControllerProvider).failedAttempts, 0);
    });
  });
}
