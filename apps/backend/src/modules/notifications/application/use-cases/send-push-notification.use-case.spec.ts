import { SendPushNotificationUseCase } from './send-push-notification.use-case';
import { PushNotification } from '../../domain/value-objects/push-notification.vo';
import { SendResults } from '../ports/push-notification.provider';
import { NotificationDeliveryLog } from '../../domain/entities/notification-delivery-log.entity';

describe('SendPushNotificationUseCase', () => {
  const notification = PushNotification.create({
    type: 'reminder',
    title: 'Conecta Geração',
    body: 'Você tem uma conversa aguardando. Toque para continuar.',
    deepLink: '/conversations/conv-1',
    conversationId: 'conv-1',
  });

  it('envia push quando usuário elegível', async () => {
    const pushProvider = {
      send: jest.fn().mockResolvedValue(SendResults.sent(['msg-1'])),
    };
    const deliveryLogs = {
      save: jest.fn().mockResolvedValue({}),
      existsSentWithin: jest.fn(),
      existsUserSentWithin: jest.fn(),
      findLastSentReminder: jest.fn(),
    };
    const analytics = { trackNotificationSent: jest.fn().mockResolvedValue(undefined) };

    const useCase = new SendPushNotificationUseCase(
      { assertSafePayload: jest.fn() } as never,
      { canSend: jest.fn().mockResolvedValue({ eligible: true }) } as never,
      { canSendReminder: jest.fn().mockResolvedValue(true) } as never,
      pushProvider as never,
      deliveryLogs as never,
      analytics as never,
    );

    const result = await useCase.execute('user-a', notification);

    expect(result.status).toBe('sent');
    expect(pushProvider.send).toHaveBeenCalledWith('user-a', notification);
    expect(deliveryLogs.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'sent', conversationId: 'conv-1' }),
    );
    expect(analytics.trackNotificationSent).toHaveBeenCalledWith(
      expect.objectContaining({ notificationType: 'reminder' }),
    );
  });

  it('pula envio quando preferência desativada', async () => {
    const pushProvider = { send: jest.fn() };
    const deliveryLogs = {
      save: jest.fn().mockResolvedValue(NotificationDeliveryLog.createSkipped({
        firebaseUid: 'user-a',
        conversationId: 'conv-1',
        notificationType: 'reminder',
        skippedReason: 'preference_disabled',
      })),
      existsSentWithin: jest.fn(),
      existsUserSentWithin: jest.fn(),
      findLastSentReminder: jest.fn(),
    };
    const analytics = { trackNotificationSent: jest.fn() };

    const useCase = new SendPushNotificationUseCase(
      { assertSafePayload: jest.fn() } as never,
      {
        canSend: jest.fn().mockResolvedValue({ eligible: false, reason: 'preference_disabled' }),
      } as never,
      { canSendReminder: jest.fn() } as never,
      pushProvider as never,
      deliveryLogs as never,
      analytics as never,
    );

    const result = await useCase.execute('user-a', notification);

    expect(result.status).toBe('skipped');
    expect(result.skippedReason).toBe('preference_disabled');
    expect(pushProvider.send).not.toHaveBeenCalled();
    expect(analytics.trackNotificationSent).not.toHaveBeenCalled();
  });

  it('pula lembrete quando cooldown ativo', async () => {
    const pushProvider = { send: jest.fn() };
    const deliveryLogs = {
      save: jest.fn().mockResolvedValue({}),
      existsSentWithin: jest.fn(),
      existsUserSentWithin: jest.fn(),
      findLastSentReminder: jest.fn(),
    };
    const analytics = { trackNotificationSent: jest.fn() };

    const useCase = new SendPushNotificationUseCase(
      { assertSafePayload: jest.fn() } as never,
      { canSend: jest.fn().mockResolvedValue({ eligible: true }) } as never,
      { canSendReminder: jest.fn().mockResolvedValue(false) } as never,
      pushProvider as never,
      deliveryLogs as never,
      analytics as never,
    );

    const result = await useCase.execute('user-a', notification);

    expect(result.status).toBe('skipped');
    expect(result.skippedReason).toBe('cooldown_active');
    expect(pushProvider.send).not.toHaveBeenCalled();
  });
});
