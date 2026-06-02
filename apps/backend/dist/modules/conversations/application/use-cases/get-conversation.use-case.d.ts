import { Result } from '../../../../shared/result';
import { Conversation } from '../../domain/entities/conversation.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { ConversationOwnershipPolicy } from '../../domain/services/conversation-ownership.policy';
import { ConversationRepository } from '../ports/conversation.repository';
import { MessageRepository } from '../ports/message.repository';
export declare class GetConversationUseCase {
    private readonly conversations;
    private readonly messages;
    private readonly ownership;
    constructor(conversations: ConversationRepository, messages: MessageRepository, ownership: ConversationOwnershipPolicy);
    execute(firebaseUid: string, conversationId: string): Promise<Result<Conversation, DomainError>>;
}
