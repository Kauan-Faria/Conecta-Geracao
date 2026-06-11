import { NotificationPreference } from '../../domain/entities/notification-preference.entity';
import { GetNotificationPreferenceUseCase } from './get-notification-preference.use-case';

describe('GetNotificationPreferenceUseCase', () => {
  it('retorna preferência default quando ausente', async () => {
    const preference = NotificationPreference.createDefault('user-a');
    const preferences = {
      getOrCreateDefault: jest.fn().mockResolvedValue(preference),
    };

    const useCase = new GetNotificationPreferenceUseCase(preferences as never);
    const result = await useCase.execute('user-a');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.enabled).toBe(true);
    }
  });
});
