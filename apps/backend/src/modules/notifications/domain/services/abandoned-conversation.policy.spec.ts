import { AbandonedConversationPolicy } from './abandoned-conversation.policy';

describe('AbandonedConversationPolicy', () => {
  const policy = new AbandonedConversationPolicy();

  it('aceita conversas in_progress', () => {
    expect(
      policy.isEligible({
        conversationId: 'conv-1',
        firebaseUid: 'user-a',
        lastActivityAt: new Date(),
        status: 'in_progress',
      }),
    ).toBe(true);
  });

  it('rejeita conversas completed', () => {
    expect(
      policy.isEligible({
        conversationId: 'conv-1',
        firebaseUid: 'user-a',
        lastActivityAt: new Date(),
        status: 'completed',
      }),
    ).toBe(false);
  });
});
