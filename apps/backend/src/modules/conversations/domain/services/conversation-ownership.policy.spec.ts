import { Conversation } from '../entities/conversation.entity';
import { ConversationNotFoundError } from '../errors/domain.errors';
import { ConversationStatus } from '../value-objects/conversation-status.vo';
import { ConversationOwnershipPolicy } from './conversation-ownership.policy';

describe('ConversationOwnershipPolicy', () => {
  const policy = new ConversationOwnershipPolicy();

  const conversation = Conversation.create({
    id: 'conv-1',
    firebaseUid: 'user-a',
    status: ConversationStatus.inProgress(),
  });

  it('retorna conversa quando usuário é o dono', () => {
    expect(policy.assertOwner(conversation, 'user-a')).toBe(conversation);
  });

  it('lança erro quando conversa é de outro usuário', () => {
    expect(() => policy.assertOwner(conversation, 'user-b')).toThrow(ConversationNotFoundError);
  });

  it('lança erro quando conversa não existe', () => {
    expect(() => policy.assertOwner(null, 'user-a')).toThrow(ConversationNotFoundError);
  });
});
