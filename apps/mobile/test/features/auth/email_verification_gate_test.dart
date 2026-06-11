import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/features/accessibility/presentation/accessibility_controller.dart';
import 'package:conecta_geracao/features/auth/presentation/auth_controller.dart';
import 'package:conecta_geracao/features/auth/domain/app_user.dart';
import 'package:conecta_geracao/features/auth/presentation/email_verification_gate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_auth_repository.dart';

void main() {
  group('needsEmailVerificationProvider', () {
    test('returns true for unverified email user', () {
      expect(userNeedsEmailVerification(unverifiedEmailTestUser), isTrue);
    });

    test('returns false for verified google user', () async {
      SharedPreferences.setMockInitialValues({});
      final sharedPreferences = await SharedPreferences.getInstance();

      final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(
            FakeAuthRepository(initialUser: authenticatedTestUser),
          ),
          sharedPreferencesProvider.overrideWithValue(sharedPreferences),
        ],
      );
      addTearDown(container.dispose);

      expect(container.read(needsEmailVerificationProvider), isFalse);
    });

    test('returns false for phone user without email', () async {
      SharedPreferences.setMockInitialValues({});
      final sharedPreferences = await SharedPreferences.getInstance();

      const phoneUser = AppUser(
        uid: 'phone-uid',
        displayName: null,
        email: null,
      );

      final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(
            FakeAuthRepository(initialUser: phoneUser),
          ),
          sharedPreferencesProvider.overrideWithValue(sharedPreferences),
        ],
      );
      addTearDown(container.dispose);

      expect(container.read(needsEmailVerificationProvider), isFalse);
    });
  });
}
