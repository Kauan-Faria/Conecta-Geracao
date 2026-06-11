class AppUser {
  const AppUser({
    required this.uid,
    required this.displayName,
    required this.email,
    this.emailVerified = true,
  });

  final String uid;
  final String? displayName;
  final String? email;
  final bool emailVerified;
}
