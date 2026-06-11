import { ProcessAbandonedConversationsUseCase } from './process-abandoned-conversations.use-case';
import { SendResults } from '../ports/push-notification.provider';

describe('ProcessAbandonedConversationsUseCase', () => {
  it('processa conversas abandonadas elegíveis', async () => {
    const snapshots = [
      {
        conversationId: 'conv-1',
        firebaseUid: 'user-a',
        lastActivityAt: new Date('2026-06-01T00:00:00Z'),
        status: 'in_progress' as const,
      },
    ];

    const sendPush = {
      execute: jest.fn().mockResolvedValue(SendResults.sent(['msg-1'])),
    };

    const useCase = new ProcessAbandonedConversationsUseCase(
      { findAbandoned: jest.fn().mockResolvedValue(snapshots) } as never,
      { isEligible: jest.fn().mockReturnValue(true) } as never,
      { canSend: jest.fn().mockResolvedValue({ eligible: true }) } as never,
      { canSendReminder: jest.fn().mockResolvedValue(true) } as never,
      sendPush as never,
    );

    const result = await useCase.execute();

    expect(result).toEqual({ processed: 1, sent: 1, skipped: 0 });
    expect(sendPush.execute).toHaveBeenCalledTimes(1);
  });

  it('ignora conversas não elegíveis', async () => {
    const sendPush = { execute: jest.fn() };

    const useCase = new ProcessAbandonedConversationsUseCase(
      {
        findAbandoned: jest.fn().mockResolvedValue([
          {
            conversationId: 'conv-1',
            firebaseUid: 'user-a',
            lastActivityAt: new Date('2026-06-01T00:00:00Z'),
            status: 'completed' as const,
          },
        ]),
      } as never,
      { isEligible: jest.fn().mockReturnValue(false) } as never,
      { canSend: jest.fn() } as never,
      { canSendReminder: jest.fn() } as never,
      sendPush as never,
    );

    const result = await useCase.execute();

    expect(result).toEqual({ processed: 1, sent: 0, skipped: 1 });
    expect(sendPush.execute).not.toHaveBeenCalled();
  });

  it('conta skip quando usuário inelegível', async () => {
    const sendPush = { execute: jest.fn() };

    const useCase = new ProcessAbandonedConversationsUseCase(
      {
        findAbandoned: jest.fn().mockResolvedValue([
          {
            conversationId: 'conv-1',
            firebaseUid: 'user-a',
            lastActivityAt: new Date('2026-06-01T00:00:00Z'),
            status: 'in_progress' as const,
          },
        ]),
      } as never,
      { isEligible: jest.fn().mockReturnValue(true) } as never,
      {
        canSend: jest.fn().mockResolvedValue({ eligible: false, reason: 'no_active_tokens' }),
      } as never,
      { canSendReminder: jest.fn() } as never,
      sendPush as never,
    );

    const result = await useCase.execute();

    expect(result).toEqual({ processed: 1, sent: 0, skipped: 1 });
    expect(sendPush.execute).not.toHaveBeenCalled();
  });
});
