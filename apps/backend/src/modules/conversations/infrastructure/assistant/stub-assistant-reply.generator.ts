import { Injectable } from '@nestjs/common';
import { AssistantReplyGenerator } from '../../application/ports/assistant-reply.generator';
import { MessageContent } from '../../domain/value-objects/message-content.vo';

@Injectable()
export class StubAssistantReplyGenerator implements AssistantReplyGenerator {
  async generateReply(input: {
    conversationId: string;
    userMessage: string;
    topicSlug?: string | null;
    currentStep: number;
    messageHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  }): Promise<{ content: MessageContent; nextCurrentStep: number }> {
    const topicHint = input.topicSlug ? ` (tópico: ${input.topicSlug})` : '';
    return {
      content: MessageContent.create(
        `Recebi sua mensagem: ${input.userMessage}${topicHint}. (Resposta automática — assistente completo em breve.)`,
      ),
      nextCurrentStep: input.currentStep,
    };
  }
}
