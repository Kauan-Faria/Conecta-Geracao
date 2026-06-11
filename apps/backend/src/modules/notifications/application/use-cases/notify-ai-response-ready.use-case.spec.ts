import { NotifyAiResponseReadyUseCase } from './notify-ai-response-ready.use-case';
import { SendResults } from '../ports/push-notification.provider';
import { PushNotification } from '../../domain/value-objects/push-notification.vo';

describe('NotifyAiResponseReadyUseCase', () => {
  it('envia push quando app está em background', async () => {
    const sendPush = {
      execute: jest.fn().mockResolvedValue(SendResults.sent(['msg-1'])),
    };

    const useCase = new NotifyAiResponseReadyUseCase(
      { shouldNotify: jest.fn().mockReturnValue(true) } as never,
      sendPush as never,
    );

    const result = await useCase.execute({
      conversationId: 'conv-1',
      firebaseUid: 'user-a',
      appInBackground: true,
    });

    expect(result?.status).toBe('sent');
    expect(sendPush.execute).toHaveBeenCalledWith(
      'user-a',
      PushNotification.create({
        type: 'ai_response',
        title: 'Conecta Geração',
        body: 'Sua orientação está pronta.',
        deepLink: '/conversations/conv-1',
        conversationId: 'conv-1',
      }),
    );
  });

  it('não envia quando app está em foreground', async () => {
    const sendPush = { execute: jest.fn() };

    const useCase = new NotifyAiResponseReadyUseCase(
      { shouldNotify: jest.fn().mockReturnValue(false) } as never,
      sendPush as never,
    );

    const result = await useCase.execute({
      conversationId: 'conv-1',
      firebaseUid: 'user-a',
      appInBackground: false,
    });

    expect(result?.status).toBe('skipped');
    expect(result?.skippedReason).toBe('app_in_foreground');
    expect(sendPush.execute).not.toHaveBeenCalled();
  });
});
