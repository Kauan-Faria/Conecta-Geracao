import { AiResponseNotificationPolicy } from './ai-response-notification.policy';

describe('AiResponseNotificationPolicy', () => {
  const policy = new AiResponseNotificationPolicy();

  it('notifica quando app está em background', () => {
    expect(
      policy.shouldNotify({
        conversationId: 'conv-1',
        firebaseUid: 'user-a',
        appInBackground: true,
      }),
    ).toBe(true);
  });

  it('não notifica quando app está em foreground', () => {
    expect(
      policy.shouldNotify({
        conversationId: 'conv-1',
        firebaseUid: 'user-a',
        appInBackground: false,
      }),
    ).toBe(false);
  });
});
