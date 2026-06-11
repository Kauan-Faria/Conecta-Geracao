import { PushNotification } from '../value-objects/push-notification.vo';
import { PushNotificationPayloadPolicy } from './push-notification-payload.policy';

describe('PushNotificationPayloadPolicy', () => {
  const policy = new PushNotificationPayloadPolicy();

  it('aceita payload seguro', () => {
    const notification = PushNotification.create({
      type: 'reminder',
      title: 'Conversa pendente',
      body: 'Retome quando puder.',
      deepLink: '/chat/abc',
    });

    expect(() => policy.assertSafePayload(notification)).not.toThrow();
  });
});
