import { Conversation } from '../../domain/entities/conversation.entity';
import { Message } from '../../domain/entities/conversation.entity';
export interface MapActionDto {
    type: 'map_search';
    category: string;
    radiusKm: number;
    center?: {
        lat: number;
        lon: number;
    } | null;
}
export interface MessageMetadataDto {
    map_action?: MapActionDto;
}
export interface ConversationSummaryDto {
    id: string;
    topicSlug: string | null;
    status: string;
    currentStep: number;
    createdAt: string;
    updatedAt: string;
}
export interface MessageDto {
    id: string;
    role: string;
    content: string;
    metadata?: MessageMetadataDto | null;
    createdAt: string;
}
export interface ConversationDetailDto extends ConversationSummaryDto {
    messages: MessageDto[];
}
export declare function toConversationSummary(conversation: Conversation): ConversationSummaryDto;
export declare function toMessageDto(message: Message): MessageDto;
export declare function toConversationDetail(conversation: Conversation): ConversationDetailDto;
