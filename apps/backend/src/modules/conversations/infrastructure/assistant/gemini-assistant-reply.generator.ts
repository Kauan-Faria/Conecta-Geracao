import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  AssistantReplyGenerator,
  AssistantReplyInput,
  AssistantReplyResult,
} from '../../application/ports/assistant-reply.generator';
import {
  KNOWLEDGE_RETRIEVER,
  KnowledgeRetriever,
} from '../../application/ports/knowledge-retriever';
import { LLM_PROVIDER, LlmProvider } from '../../application/ports/llm-provider';
import { CheckpointResponsePolicy } from '../../domain/services/checkpoint-response.policy';
import { SensitiveContentPolicy } from '../../domain/services/sensitive-content.policy';
import { MessageContent } from '../../domain/value-objects/message-content.vo';
import { RagPromptBuilder } from './rag-prompt.builder';

@Injectable()
export class GeminiAssistantReplyGenerator implements AssistantReplyGenerator {
  private readonly logger = new Logger(GeminiAssistantReplyGenerator.name);
  private readonly guardrails = new SensitiveContentPolicy();
  private readonly checkpoints = new CheckpointResponsePolicy();
  private readonly promptBuilder = new RagPromptBuilder();

  constructor(
    @Inject(KNOWLEDGE_RETRIEVER)
    private readonly knowledge: KnowledgeRetriever,
    @Inject(LLM_PROVIDER)
    private readonly llm: LlmProvider,
  ) {}

  async generateReply(input: AssistantReplyInput): Promise<AssistantReplyResult> {
    if (this.guardrails.containsSensitiveInput(input.userMessage)) {
      this.logger.warn(
        `Input sensível bloqueado (conversa=${input.conversationId}): ${this.guardrails.sanitizeForLog(input.userMessage)}`,
      );
      return {
        content: MessageContent.create(this.guardrails.refusalMessage()),
        nextCurrentStep: input.currentStep,
        resolvedTopicSlug: input.topicSlug,
      };
    }

    const knowledge = await this.knowledge.retrieve({
      topicSlug: input.topicSlug,
      userMessage: input.userMessage,
    });

    const stepCount = knowledge.steps.length;
    const checkpointDecision = this.checkpoints.evaluate(input.userMessage);
    const nextCurrentStep = this.checkpoints.resolveNextStep(
      input.currentStep,
      checkpointDecision,
      stepCount,
    );

    const systemPrompt = this.promptBuilder.buildSystemPrompt();
    const userPrompt = this.promptBuilder.buildUserPrompt({
      knowledge,
      currentStep: input.currentStep,
      checkpointDecision,
      userMessage: input.userMessage,
      messageHistory: input.messageHistory,
    });

    let rawReply: string;
    try {
      rawReply = await this.llm.generate({ systemPrompt, userPrompt });
    } catch (error) {
      this.logger.error(
        `Falha ao chamar Gemini (conversa=${input.conversationId})`,
        error instanceof Error ? error.message : error,
      );
      rawReply =
        'Estou com dificuldade técnica no momento. Tente novamente em instantes ou escolha um dos tópicos disponíveis no menu.';
    }

    if (this.guardrails.containsUnsafeOutput(rawReply)) {
      this.logger.warn(`Saída insegura substituída (conversa=${input.conversationId})`);
      rawReply = this.guardrails.refusalMessage();
    }

    if (!knowledge.topicSlug && knowledge.availableTopics.length > 0) {
      const list = knowledge.availableTopics.map((t) => `• ${t.title}`).join('\n');
      rawReply = `${rawReply}\n\nPosso ajudar com estes assuntos:\n${list}`;
    }

    const resolvedTopicSlug =
      input.topicSlug ?? (knowledge.inferredFromMessage ? knowledge.topicSlug : null);

    return {
      content: MessageContent.create(rawReply),
      nextCurrentStep,
      resolvedTopicSlug,
    };
  }
}
