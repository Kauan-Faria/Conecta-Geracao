import { Injectable } from '@nestjs/common';
import {
  AssistantReplyGenerator,
  AssistantReplyInput,
  AssistantReplyResult,
} from '../../application/ports/assistant-reply.generator';
import { MessageContent } from '../../domain/value-objects/message-content.vo';

@Injectable()
export class StubAssistantReplyGenerator implements AssistantReplyGenerator {
  async generateReply(input: AssistantReplyInput): Promise<AssistantReplyResult> {
    const topicHint = input.topicSlug ? ` (tópico: ${input.topicSlug})` : '';
    return {
      content: MessageContent.create(
        `Recebi sua mensagem: ${input.userMessage}${topicHint}. (Resposta automática — assistente completo em breve.)`,
      ),
      nextCurrentStep: input.currentStep,
      resolvedTopicSlug: input.topicSlug ?? null,
      replyMode: 'rag',
    };
  }
}
