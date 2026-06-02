import { Conversation } from '../entities/conversation.entity';
export declare class ConversationOwnershipPolicy {
    assertOwner(conversation: Conversation | null, firebaseUid: string): Conversation;
}
