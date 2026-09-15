import { MessageContent } from '../../domain/value-objects/message-content.vo';
import { MapAction } from '../../domain/value-objects/map-action.vo';
import { ReplyMode } from '../../domain/value-objects/reply-mode.vo';

export interface AssistantMessageTurn {
  role: 'user' | 'assistant';
  content: string;
  replyMode?: ReplyMode;
}

export interface AssistantReplyInput {
  conversationId: string;
  userMessage: string;
  topicSlug?: string | null;
  currentStep: number;
  messageHistory: AssistantMessageTurn[];
}

export interface AssistantReplyResult {
  content: MessageContent;
  nextCurrentStep: number;
  resolvedTopicSlug: string | null;
  replyMode?: ReplyMode;
  mapAction?: MapAction;
}

export const ASSISTANT_REPLY_GENERATOR = Symbol('ASSISTANT_REPLY_GENERATOR');

export interface AssistantReplyGenerator {
  generateReply(input: AssistantReplyInput): Promise<AssistantReplyResult>;
}
