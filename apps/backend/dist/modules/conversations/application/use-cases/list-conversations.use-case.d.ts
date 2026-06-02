import { Result } from '../../../../shared/result';
import { Conversation } from '../../domain/entities/conversation.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { ConversationRepository, PaginationParams } from '../ports/conversation.repository';
export interface ListConversationsResult {
    items: Conversation[];
    total: number;
}
export declare class ListConversationsUseCase {
    private readonly conversations;
    constructor(conversations: ConversationRepository);
    execute(firebaseUid: string, pagination: PaginationParams): Promise<Result<ListConversationsResult, DomainError>>;
}
