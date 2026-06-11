import { NotificationEligibilityPolicy } from './notification-eligibility.policy';

describe('NotificationEligibilityPolicy', () => {
  it('retorna elegível quando preferência ativa e há tokens', async () => {
    const policy = new NotificationEligibilityPolicy(
      {
        getOrCreateDefault: jest.fn().mockResolvedValue({ enabled: true }),
      } as never,
      {
        findActiveByFirebaseUid: jest.fn().mockResolvedValue([{ id: 'dt-1' }]),
      } as never,
    );

    await expect(policy.canSend('user-a')).resolves.toEqual({ eligible: true });
  });

  it('retorna inelegível quando preferência desativada', async () => {
    const policy = new NotificationEligibilityPolicy(
      {
        getOrCreateDefault: jest.fn().mockResolvedValue({ enabled: false }),
      } as never,
      { findActiveByFirebaseUid: jest.fn() } as never,
    );

    await expect(policy.canSend('user-a')).resolves.toEqual({
      eligible: false,
      reason: 'preference_disabled',
    });
  });

  it('retorna inelegível quando não há tokens ativos', async () => {
    const policy = new NotificationEligibilityPolicy(
      {
        getOrCreateDefault: jest.fn().mockResolvedValue({ enabled: true }),
      } as never,
      {
        findActiveByFirebaseUid: jest.fn().mockResolvedValue([]),
      } as never,
    );

    await expect(policy.canSend('user-a')).resolves.toEqual({
      eligible: false,
      reason: 'no_active_tokens',
    });
  });
});
