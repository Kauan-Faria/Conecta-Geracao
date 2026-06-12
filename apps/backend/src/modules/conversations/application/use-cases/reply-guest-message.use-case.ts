import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ASSISTANT_REPLY_GENERATOR,
  AssistantReplyGenerator,
  AssistantMessageTurn,
} from '../ports/assistant-reply.generator';
import { MessageMetadata } from '../../domain/value-objects/message-metadata.vo';

export interface GuestAssistantReply {
  id: string;
  role: 'assistant';
  content: string;
  currentStep: number;
  topicSlug: string | null;
  metadata: ReturnType<typeof MessageMetadata.fromMapAction> | null;
  createdAt: string;
}

@Injectable()
export class ReplyGuestMessageUseCase {
  constructor(
    @Inject(ASSISTANT_REPLY_GENERATOR)
    private readonly replyGenerator: AssistantReplyGenerator,
  ) {}

  async execute(input: {
    content: string;
    topicSlug?: string | null;
    currentStep: number;
    messageHistory: AssistantMessageTurn[];
  }): Promise<GuestAssistantReply> {
    const assistantReply = await this.replyGenerator.generateReply({
      conversationId: 'guest-ephemeral',
      userMessage: input.content,
      topicSlug: input.topicSlug,
      currentStep: input.currentStep,
      messageHistory: input.messageHistory,
    });

    const metadata = assistantReply.mapAction
      ? MessageMetadata.fromMapAction(assistantReply.mapAction)
      : null;

    return {
      id: randomUUID(),
      role: 'assistant',
      content: assistantReply.content.value,
      currentStep: assistantReply.nextCurrentStep,
      topicSlug: assistantReply.resolvedTopicSlug ?? input.topicSlug ?? null,
      metadata,
      createdAt: new Date().toISOString(),
    };
  }
}
