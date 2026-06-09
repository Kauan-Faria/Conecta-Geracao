import { Inject, Injectable } from '@nestjs/common';
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
import {
  CategoryDisambiguator,
} from '../../domain/services/category-disambiguator.service';
import { CheckpointResponsePolicy } from '../../domain/services/checkpoint-response.policy';
import { LocationIntentClassifier } from '../../domain/services/location-intent.classifier';
import { MapActionBuilder } from '../../domain/services/map-action-builder.service';
import { RadiusSuggestionPolicy } from '../../domain/services/radius-suggestion.policy';
import { SensitiveContentPolicy } from '../../domain/services/sensitive-content.policy';
import { MessageContent } from '../../domain/value-objects/message-content.vo';
import { RagPromptBuilder } from './rag-prompt.builder';
import {
  buildLocationReplyPrompt,
  LOCATION_INTENT_SYSTEM_APPENDIX,
} from './location-intent.prompt';

const CATEGORY_LABELS: Record<string, string> = {
  pharmacy: 'uma farmácia',
  health_post: 'um posto de saúde (UBS)',
  hospital: 'um hospital ou UPA',
  bank: 'um banco ou caixa eletrônico',
  post_office: 'uma agência dos Correios',
  supermarket: 'um supermercado',
};

@Injectable()
export class GeminiAssistantReplyGenerator implements AssistantReplyGenerator {
  private readonly guardrails = new SensitiveContentPolicy();
  private readonly checkpoints = new CheckpointResponsePolicy();
  private readonly promptBuilder = new RagPromptBuilder();
  private readonly locationIntent = new LocationIntentClassifier();
  private readonly categoryDisambiguator = new CategoryDisambiguator();
  private readonly radiusPolicy = new RadiusSuggestionPolicy();
  private readonly mapActionBuilder = new MapActionBuilder();

  constructor(
    @Inject(KNOWLEDGE_RETRIEVER)
    private readonly knowledge: KnowledgeRetriever,
    @Inject(LLM_PROVIDER)
    private readonly llm: LlmProvider,
  ) {}

  async generateReply(input: AssistantReplyInput): Promise<AssistantReplyResult> {
    if (this.guardrails.containsSensitiveInput(input.userMessage)) {
      return {
        content: MessageContent.create(this.guardrails.refusalMessage()),
        nextCurrentStep: input.currentStep,
        resolvedTopicSlug: input.topicSlug,
      };
    }

    const locationAnalysis = this.locationIntent.analyze(input.userMessage);
    if (locationAnalysis.isGeographic) {
      return this.generateGeographicReply(input, locationAnalysis.hints);
    }

    return this.generateKnowledgeReply(input);
  }

  private async generateGeographicReply(
    input: AssistantReplyInput,
    hints: ReturnType<LocationIntentClassifier['analyze']>['hints'],
  ): Promise<AssistantReplyResult> {
    const categoryResolution = this.categoryDisambiguator.resolve(
      input.userMessage,
      input.messageHistory,
    );

    if (categoryResolution.type === 'clarification') {
      return {
        content: MessageContent.create(categoryResolution.question),
        nextCurrentStep: input.currentStep,
        resolvedTopicSlug: input.topicSlug,
      };
    }

    if (categoryResolution.type === 'none') {
      return this.generateKnowledgeReply(input);
    }

    const radius = this.radiusPolicy.suggest(input.userMessage, hints);
    const mapAction = this.mapActionBuilder.build({
      category: categoryResolution.category,
      radius,
    });

    const categoryLabel =
      CATEGORY_LABELS[categoryResolution.category.value] ?? 'um lugar próximo';
    const radiusExplanation = this.radiusPolicy.explanation(radius);

    let rawReply: string;
    try {
      rawReply = await this.llm.generate({
        systemPrompt: `${this.promptBuilder.buildSystemPrompt()}\n\n${LOCATION_INTENT_SYSTEM_APPENDIX}`,
        userPrompt: buildLocationReplyPrompt({
          categoryLabel,
          radiusExplanation,
          userMessage: input.userMessage,
        }),
      });
    } catch {
      rawReply = `Entendi! ${radiusExplanation} Vou te ajudar a encontrar ${categoryLabel}.`;
    }

    if (this.guardrails.containsUnsafeOutput(rawReply)) {
      rawReply = `Entendi! ${radiusExplanation} Vou te ajudar a encontrar ${categoryLabel}.`;
    }

    return {
      content: MessageContent.create(rawReply),
      nextCurrentStep: input.currentStep,
      resolvedTopicSlug: input.topicSlug,
      mapAction,
    };
  }

  private async generateKnowledgeReply(
    input: AssistantReplyInput,
  ): Promise<AssistantReplyResult> {
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
    } catch {
      rawReply =
        'Estou com dificuldade técnica no momento. Tente novamente em instantes ou escolha um dos tópicos disponíveis no menu.';
    }

    if (this.guardrails.containsUnsafeOutput(rawReply)) {
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
