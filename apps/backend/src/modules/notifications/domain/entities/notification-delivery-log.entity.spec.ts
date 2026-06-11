import { NotificationDeliveryLog } from './notification-delivery-log.entity';

describe('NotificationDeliveryLog', () => {
  it('cria log de envio', () => {
    const log = NotificationDeliveryLog.createSent({
      firebaseUid: 'user-a',
      conversationId: 'conv-1',
      notificationType: 'reminder',
      fcmMessageId: 'msg-1',
    });

    expect(log.status).toBe('sent');
    expect(log.fcmMessageId).toBe('msg-1');
  });

  it('cria log de skip', () => {
    const log = NotificationDeliveryLog.createSkipped({
      firebaseUid: 'user-a',
      conversationId: 'conv-1',
      notificationType: 'reminder',
      skippedReason: 'cooldown_active',
    });

    expect(log.status).toBe('skipped');
    expect(log.skippedReason).toBe('cooldown_active');
  });
});
