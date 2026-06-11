import { NotificationPreference } from '../../domain/entities/notification-preference.entity';
import { UpdateNotificationPreferenceUseCase } from './update-notification-preference.use-case';

describe('UpdateNotificationPreferenceUseCase', () => {
  it('atualiza preferência existente', async () => {
    const existing = NotificationPreference.reconstitute({
      firebaseUid: 'user-a',
      enabled: true,
    });
    const updated = existing.updateEnabled(false);

    const preferences = {
      findByFirebaseUid: jest.fn().mockResolvedValue(existing),
      upsert: jest.fn().mockResolvedValue(updated),
    };

    const useCase = new UpdateNotificationPreferenceUseCase(preferences as never);
    const result = await useCase.execute('user-a', false);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.enabled).toBe(false);
    }
  });

  it('cria preferência quando ausente', async () => {
    const created = NotificationPreference.createDefault('user-a').updateEnabled(false);
    const preferences = {
      findByFirebaseUid: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue(created),
    };

    const useCase = new UpdateNotificationPreferenceUseCase(preferences as never);
    const result = await useCase.execute('user-a', false);

    expect(result.ok).toBe(true);
    expect(preferences.upsert).toHaveBeenCalled();
  });
});
