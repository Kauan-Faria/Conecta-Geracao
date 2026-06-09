class PhoneVerificationSession {
  const PhoneVerificationSession({
    required this.verificationId,
    required this.e164Phone,
    this.resendToken,
  });

  final String verificationId;
  final String e164Phone;
  final int? resendToken;
}
