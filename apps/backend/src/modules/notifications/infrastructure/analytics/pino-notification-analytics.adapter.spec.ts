import { NotificationSentEvent } from '../../domain/value-objects/notification-sent-event.vo';
import { PinoNotificationAnalyticsAdapter } from './pino-notification-analytics.adapter';

describe('PinoNotificationAnalyticsAdapter', () => {
  it('emite log notification_sent sem PII', async () => {
    const adapter = new PinoNotificationAnalyticsAdapter();
    const logSpy = jest.spyOn(adapter['logger'], 'log');

    await adapter.trackNotificationSent(
      NotificationSentEvent.create({
        notificationType: 'tip',
        occurredAt: new Date('2026-06-09T12:00:00.000Z'),
        tipId: 'tip-1',
      }),
    );

    expect(logSpy).toHaveBeenCalledWith({
      event: 'notification_sent',
      notificationType: 'tip',
      occurredAt: '2026-06-09T12:00:00.000Z',
      tipId: 'tip-1',
    });

    const payload = logSpy.mock.calls[0]![0] as Record<string, string>;
    expect(payload).not.toHaveProperty('firebaseUid');
    expect(payload).not.toHaveProperty('token');
    expect(payload).not.toHaveProperty('conversationId');
  });
});
