import 'package:conecta_geracao/core/routing/routing_providers.dart';
import 'package:conecta_geracao/features/auth/domain/app_user.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

bool userNeedsDisplayName(AppUser? user) {
  if (user == null) {
    return false;
  }
  final name = user.displayName?.trim();
  return name == null || name.isEmpty;
}

final needsDisplayNameProvider = Provider<bool>((ref) {
  final user = ref.watch(authGateProvider).user;
  return userNeedsDisplayName(user);
});
