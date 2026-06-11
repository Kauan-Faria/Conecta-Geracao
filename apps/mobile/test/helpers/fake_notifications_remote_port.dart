import 'package:conecta_geracao/features/notifications/data/notifications_api.dart';
import 'package:conecta_geracao/features/notifications/domain/device_platform.dart';

class FakeNotificationsRemotePort implements NotificationsRemotePort {
  @override
  Future<void> registerDeviceToken({
    required String token,
    required DevicePlatform platform,
  }) async {}

  @override
  Future<void> deactivateDeviceToken({required String token}) async {}

  @override
  Future<NotificationPreferenceResponse> getPreference() async {
    return NotificationPreferenceResponse(
      enabled: true,
      updatedAt: DateTime.utc(2026, 6, 10),
    );
  }

  @override
  Future<NotificationPreferenceResponse> updatePreference({
    required bool enabled,
  }) async {
    return NotificationPreferenceResponse(
      enabled: enabled,
      updatedAt: DateTime.utc(2026, 6, 10),
    );
  }
}
