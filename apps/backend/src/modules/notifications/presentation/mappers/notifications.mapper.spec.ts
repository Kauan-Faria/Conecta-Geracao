import { DeviceToken } from '../../domain/entities/device-token.entity';
import { NotificationPreference } from '../../domain/entities/notification-preference.entity';
import { DevicePlatform } from '../../domain/value-objects/device-platform.vo';
import { FcmToken } from '../../domain/value-objects/fcm-token.vo';
import {
  toDeviceTokenDto,
  toNotificationPreferenceDto,
} from './notifications.mapper';

describe('notifications.mapper', () => {
  it('toDeviceTokenDto omite token FCM', () => {
    const token = DeviceToken.reconstitute({
      id: 'dt-1',
      firebaseUid: 'user-a',
      token: FcmToken.create('abcdefghij123456'),
      platform: DevicePlatform.create('ios'),
      isActive: true,
      lastSeenAt: new Date('2026-06-09T12:00:00Z'),
      createdAt: new Date('2026-06-09T12:00:00Z'),
      updatedAt: new Date('2026-06-09T12:00:00Z'),
    });

    const dto = toDeviceTokenDto(token);
    expect(dto).toEqual({
      id: 'dt-1',
      platform: 'ios',
      isActive: true,
      lastSeenAt: '2026-06-09T12:00:00.000Z',
      createdAt: '2026-06-09T12:00:00.000Z',
    });
    expect(dto).not.toHaveProperty('token');
  });

  it('toNotificationPreferenceDto mapeia enabled e updatedAt', () => {
    const preference = NotificationPreference.reconstitute({
      firebaseUid: 'user-a',
      enabled: false,
      updatedAt: new Date('2026-06-09T13:00:00Z'),
    });

    expect(toNotificationPreferenceDto(preference)).toEqual({
      enabled: false,
      updatedAt: '2026-06-09T13:00:00.000Z',
    });
  });
});
