import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/features/auth/domain/app_user.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

bool userNeedsEmailVerification(AppUser? user) {
  if (user == null) {
    return false;
  }
  return user.email != null && !user.emailVerified;
}

final needsEmailVerificationProvider = Provider<bool>((ref) {
  final user = ref.watch(authGateProvider).user;
  return userNeedsEmailVerification(user);
});
