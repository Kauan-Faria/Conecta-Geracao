import { DeviceToken } from '../../domain/entities/device-token.entity';
import { DevicePlatform } from '../../domain/value-objects/device-platform.vo';
import { FcmToken } from '../../domain/value-objects/fcm-token.vo';
import { RegisterDeviceTokenUseCase } from './register-device-token.use-case';

describe('RegisterDeviceTokenUseCase', () => {
  const savedToken = DeviceToken.reconstitute({
    id: 'dt-1',
    firebaseUid: 'user-a',
    token: FcmToken.create('abcdefghij123456'),
    platform: DevicePlatform.create('android'),
    isActive: true,
    lastSeenAt: new Date('2026-06-09T12:00:00Z'),
    createdAt: new Date('2026-06-09T12:00:00Z'),
    updatedAt: new Date('2026-06-09T12:00:00Z'),
  });

  it('registra token e garante preferência default', async () => {
    const deviceTokens = { upsert: jest.fn().mockResolvedValue(savedToken) };
    const preferences = {
      getOrCreateDefault: jest.fn().mockResolvedValue({ enabled: true }),
    };

    const useCase = new RegisterDeviceTokenUseCase(
      deviceTokens as never,
      preferences as never,
    );

    const result = await useCase.execute('user-a', 'abcdefghij123456', 'android');

    expect(result.ok).toBe(true);
    expect(deviceTokens.upsert).toHaveBeenCalled();
    expect(preferences.getOrCreateDefault).toHaveBeenCalledWith('user-a');
  });

  it('retorna erro para token inválido', async () => {
    const useCase = new RegisterDeviceTokenUseCase(
      { upsert: jest.fn() } as never,
      { getOrCreateDefault: jest.fn() } as never,
    );

    const result = await useCase.execute('user-a', 'curto', 'android');
    expect(result.ok).toBe(false);
  });
});
