import { Conversation } from '../../domain/entities/conversation.entity';
import { Message } from '../../domain/entities/conversation.entity';

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
  return {
    id: message.id!,
    role: message.role.value,
    content: message.content.value,
    createdAt: message.createdAt.toISOString(),
  };
}

export function toConversationDetail(conversation: Conversation): ConversationDetailDto {
  return {
    ...toConversationSummary(conversation),
    messages: conversation.messages.map(toMessageDto),
  };
}
