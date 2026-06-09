import { Message } from '../../domain/entities/conversation.entity';
import { MessageMetadataJson } from '../../domain/value-objects/message-metadata.vo';
export declare const MESSAGE_REPOSITORY: unique symbol;
export interface MessageRepository {
    listByConversationId(conversationId: string): Promise<Message[]>;
}
export interface SendMessageTransactionInput {
    conversationId: string;
    firebaseUid: string;
    userContent: string;
    assistantContent: string;
    nextCurrentStep: number;
    topicSlug?: string | null;
    assistantMetadata?: MessageMetadataJson | null;
}
export interface SendMessageTransactionResult {
    assistantMessage: Message;
}
export interface ConversationMessageUnitOfWork {
    sendMessage(input: SendMessageTransactionInput): Promise<SendMessageTransactionResult>;
}
export declare const CONVERSATION_MESSAGE_UOW: unique symbol;
