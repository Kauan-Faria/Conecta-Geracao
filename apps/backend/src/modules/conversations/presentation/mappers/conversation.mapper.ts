import { Conversation } from '../../domain/entities/conversation.entity';
import { Message } from '../../domain/entities/conversation.entity';
import { MessageMetadataJson } from '../../domain/value-objects/message-metadata.vo';

export interface MapActionDto {
  type: 'map_search';
  category: string;
  radiusKm: number;
  center?: { lat: number; lon: number } | null;
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

export function toConversationSummary(conversation: Conversation): ConversationSummaryDto {
  return {
    id: conversation.id!,
    topicSlug: conversation.topicSlug,
    status: conversation.status.value,
    currentStep: conversation.currentStep,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export function toMessageDto(message: Message): MessageDto {
  const dto: MessageDto = {
    id: message.id!,
    role: message.role.value,
    content: message.content.value,
    createdAt: message.createdAt.toISOString(),
  };

  if (message.metadata?.map_action) {
    dto.metadata = { map_action: message.metadata.map_action };
  }

  return dto;
}

export function toConversationDetail(conversation: Conversation): ConversationDetailDto {
  return {
    ...toConversationSummary(conversation),
    messages: conversation.messages.map(toMessageDto),
  };
}
