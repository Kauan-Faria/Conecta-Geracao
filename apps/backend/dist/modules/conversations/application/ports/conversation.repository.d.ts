import { Conversation } from '../../domain/entities/conversation.entity';
export interface PaginationParams {
    page: number;
    limit: number;
}
export interface PaginatedConversations {
    items: Conversation[];
    total: number;
}
export declare const CONVERSATION_REPOSITORY: unique symbol;
export interface ConversationRepository {
    create(conversation: Conversation): Promise<Conversation>;
    findByIdForUser(id: string, firebaseUid: string): Promise<Conversation | null>;
    listByUser(firebaseUid: string, pagination: PaginationParams): Promise<PaginatedConversations>;
}
