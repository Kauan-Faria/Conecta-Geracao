import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { Conversation, Message } from '../../domain/entities/conversation.entity';
import { ConversationRepository, PaginatedConversations, PaginationParams } from '../../application/ports/conversation.repository';
import { MessageMetadataJson } from '../../domain/value-objects/message-metadata.vo';
export declare class PrismaConversationRepository implements ConversationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(conversation: Conversation): Promise<Conversation>;
    findByIdForUser(id: string, firebaseUid: string): Promise<Conversation | null>;
    listByUser(firebaseUid: string, pagination: PaginationParams): Promise<PaginatedConversations>;
    private toDomain;
}
export declare class PrismaMessageRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listByConversationId(conversationId: string): Promise<Message[]>;
    private toDomain;
}
export declare class PrismaConversationMessageUnitOfWork {
    private readonly prisma;
    constructor(prisma: PrismaService);
    sendMessage(input: {
        conversationId: string;
        firebaseUid: string;
        userContent: string;
        assistantContent: string;
        nextCurrentStep: number;
        topicSlug?: string | null;
        assistantMetadata?: MessageMetadataJson | null;
    }): Promise<{
        assistantMessage: Message;
    }>;
}
