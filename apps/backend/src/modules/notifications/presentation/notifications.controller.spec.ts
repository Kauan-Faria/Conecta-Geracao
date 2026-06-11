import { BadRequestException } from '@nestjs/common';
import { DeviceToken } from '../domain/entities/device-token.entity';
import { NotificationPreference } from '../domain/entities/notification-preference.entity';
import { InvalidFcmTokenError } from '../domain/errors/domain.errors';
import { DevicePlatform } from '../domain/value-objects/device-platform.vo';
import { FcmToken } from '../domain/value-objects/fcm-token.vo';
import { RegisterDeviceTokenUseCase } from '../application/use-cases/register-device-token.use-case';
import { UpdateNotificationPreferenceUseCase } from '../application/use-cases/update-notification-preference.use-case';
import { DeactivateDeviceTokenUseCase } from '../application/use-cases/deactivate-device-token.use-case';
import { GetNotificationPreferenceUseCase } from '../application/use-cases/get-notification-preference.use-case';
import { NotificationsController } from './notifications.controller';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let registerDeviceToken: jest.Mocked<Pick<RegisterDeviceTokenUseCase, 'execute'>>;
  let updateNotificationPreference: jest.Mocked<
    Pick<UpdateNotificationPreferenceUseCase, 'execute'>
  >;
  let deactivateDeviceToken: jest.Mocked<Pick<DeactivateDeviceTokenUseCase, 'execute'>>;
  let getNotificationPreference: jest.Mocked<Pick<GetNotificationPreferenceUseCase, 'execute'>>;

  const deviceToken = DeviceToken.reconstitute({
    id: 'dt-1',
    firebaseUid: 'user-a',
    token: FcmToken.create('abcdefghij123456'),
    platform: DevicePlatform.create('android'),
    isActive: true,
    lastSeenAt: new Date('2026-06-09T12:00:00Z'),
    createdAt: new Date('2026-06-09T12:00:00Z'),
    updatedAt: new Date('2026-06-09T12:00:00Z'),
  });

  beforeEach(() => {
    registerDeviceToken = { execute: jest.fn() };
    updateNotificationPreference = { execute: jest.fn() };
    deactivateDeviceToken = { execute: jest.fn() };
    getNotificationPreference = { execute: jest.fn() };

    controller = new NotificationsController(
      registerDeviceToken as never,
      updateNotificationPreference as never,
      deactivateDeviceToken as never,
      getNotificationPreference as never,
    );
  });

  it('PUT device-token retorna DTO sem token FCM', async () => {
    registerDeviceToken.execute.mockResolvedValue({ ok: true, value: deviceToken });

    const result = await controller.putDeviceToken(
      { uid: 'user-a' },
      { token: 'abcdefghij123456', platform: 'android' },
    );

    expect(result.id).toBe('dt-1');
    expect(result).not.toHaveProperty('token');
  });

  it('GET preferences retorna preferência do usuário', async () => {
    const preference = NotificationPreference.reconstitute({
      firebaseUid: 'user-a',
      enabled: true,
      updatedAt: new Date('2026-06-09T13:00:00Z'),
    });
    getNotificationPreference.execute.mockResolvedValue({ ok: true, value: preference });

    const result = await controller.getPreferences({ uid: 'user-a' });
    expect(result.enabled).toBe(true);
  });

  it('PUT preferences retorna enabled atualizado', async () => {
    const preference = NotificationPreference.reconstitute({
      firebaseUid: 'user-a',
      enabled: false,
      updatedAt: new Date('2026-06-09T13:00:00Z'),
    });
    updateNotificationPreference.execute.mockResolvedValue({ ok: true, value: preference });

    const result = await controller.putPreferences({ uid: 'user-a' }, { enabled: false });
    expect(result.enabled).toBe(false);
  });

  it('DELETE device-token conclui sem erro', async () => {
    deactivateDeviceToken.execute.mockResolvedValue({ ok: true, value: undefined });
    await expect(
      controller.deleteDeviceToken({ uid: 'user-a' }, { token: 'abcdefghij123456' }),
    ).resolves.toBeUndefined();
  });

  it('mapeia erro de domínio para 400', async () => {
    registerDeviceToken.execute.mockResolvedValue({
      ok: false,
      error: new InvalidFcmTokenError(),
    });

    await expect(
      controller.putDeviceToken(
        { uid: 'user-a' },
        { token: 'abcdefghij123456', platform: 'android' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
