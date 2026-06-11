import {
  buildAiResponseReady,
  buildConversationReminder,
} from './push-notification.templates';

describe('push-notification.templates', () => {
  it('monta lembrete de conversa', () => {
    const notification = buildConversationReminder('conv-1');
    expect(notification.type.value).toBe('reminder');
    expect(notification.deepLink).toBe('/conversations/conv-1');
    expect(notification.conversationId).toBe('conv-1');
  });

  it('monta notificação de resposta IA', () => {
    const notification = buildAiResponseReady('conv-2');
    expect(notification.type.value).toBe('ai_response');
    expect(notification.body).toContain('orientação');
  });
});
