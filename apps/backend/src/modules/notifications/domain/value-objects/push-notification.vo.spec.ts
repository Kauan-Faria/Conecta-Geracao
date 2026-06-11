import { InvalidPushNotificationError } from '../errors/domain.errors';
import { PushNotification } from './push-notification.vo';

describe('PushNotification', () => {
  it('aceita payload genérico válido', () => {
    const notification = PushNotification.create({
      type: 'reminder',
      title: 'Conversa em andamento',
      body: 'Você tem uma conversa pendente.',
      deepLink: '/chat/abc123',
      conversationId: 'abc123',
    });

    expect(notification.type.value).toBe('reminder');
    expect(notification.title).toBe('Conversa em andamento');
  });

  it('rejeita payload com conteúdo sensível', () => {
    expect(() =>
      PushNotification.create({
        type: 'tip',
        title: 'Dica',
        body: 'Sua senha expirou',
        deepLink: '/home',
      }),
    ).toThrow(InvalidPushNotificationError);
  });

  it('rejeita campos vazios', () => {
    expect(() =>
      PushNotification.create({
        type: 'campaign',
        title: '  ',
        body: 'Corpo',
        deepLink: '/home',
      }),
    ).toThrow(InvalidPushNotificationError);
  });
});
