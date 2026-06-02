import { Result } from '../../../../shared/result';
import { Conversation } from '../../domain/entities/conversation.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { ConversationRepository } from '../ports/conversation.repository';
export declare class CreateConversationUseCase {
    private readonly conversations;
    constructor(conversations: ConversationRepository);
    execute(firebaseUid: string, topicSlug?: string): Promise<Result<Conversation, DomainError>>;
}
