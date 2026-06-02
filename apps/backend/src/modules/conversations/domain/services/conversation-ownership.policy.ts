import { Conversation } from '../entities/conversation.entity';
import { ConversationNotFoundError } from '../errors/domain.errors';

export class ConversationOwnershipPolicy {
  assertOwner(conversation: Conversation | null, firebaseUid: string): Conversation {
    if (!conversation || conversation.firebaseUid !== firebaseUid) {
      throw new ConversationNotFoundError();
    }
    return conversation;
  }
}
