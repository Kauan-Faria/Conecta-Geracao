import { MessageContent } from '../../domain/value-objects/message-content.vo';

export interface AssistantMessageTurn {
  role: 'user' | 'assistant';
  content: string;
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
  resolvedTopicSlug?: string | null;
}

export const ASSISTANT_REPLY_GENERATOR = Symbol('ASSISTANT_REPLY_GENERATOR');

export interface AssistantReplyGenerator {
  generateReply(input: AssistantReplyInput): Promise<AssistantReplyResult>;
}
