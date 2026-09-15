import { Inject, Injectable } from '@nestjs/common';
import {
  AssistantReplyGenerator,
  AssistantReplyInput,
  AssistantReplyResult,
} from '../../application/ports/assistant-reply.generator';
import {
  KNOWLEDGE_RETRIEVER,
  KnowledgeContext,
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
import { ClarificationQuestionPolicy } from '../../domain/services/clarification-question.policy';
import { ClarificationStreakCounter } from '../../domain/services/clarification-streak.counter';
import { GeneralOrientationPolicy } from '../../domain/services/general-orientation.policy';
import { MessageSubstanceClassifier } from '../../domain/services/message-substance.classifier';
import { ReplyModeResolver } from '../../domain/services/reply-mode.resolver';
import { TopicMatch } from '../../domain/value-objects/topic-match.vo';

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
  private readonly substance = new MessageSubstanceClassifier();
  private readonly streakCounter = new ClarificationStreakCounter();
  private readonly resolver = new ReplyModeResolver();
  private readonly clarifyQuestions = new ClarificationQuestionPolicy();
  private readonly generalOrientation = new GeneralOrientationPolicy();

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
        resolvedTopicSlug: input.topicSlug ?? null,
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
        resolvedTopicSlug: input.topicSlug ?? null,
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
      resolvedTopicSlug: input.topicSlug ?? null,
      mapAction,
    };
  }

  private async generateKnowledgeReply(
    input: AssistantReplyInput,
  ): Promise<AssistantReplyResult> {
    const persisted = input.topicSlug?.trim() || null;
    const checkpointDecision = this.checkpoints.evaluate(input.userMessage);
    const isCheckpoint = this.checkpoints.isCheckpoint(input.userMessage);
    const streak = this.streakCounter.count(input.messageHistory);

    let match: TopicMatch;
    let catalog: { slug: string; title: string }[] = [];
    try {
      const inferred = await this.knowledge.inferMatch(input.userMessage);
      match = inferred.match;
      catalog = inferred.catalog;
    } catch {
      return this.failClosed(input, persisted);
    }

    const substance = this.substance.classify({
      message: input.userMessage,
      match,
      isCheckpoint,
      streakCount: streak.count,
    });

    let plan;
    try {
      plan = this.resolver.resolve({
        match,
        persisted,
        substance,
        streak,
        isCheckpoint,
        checkpointDecision,
      });
    } catch {
      return this.failClosed(input, persisted);
    }

    const resolvedTopicSlug = plan.resolvedTopicSlug(persisted);

    if (plan.mode === 'clarify') {
      const question = this.clarifyQuestions.compose(match, catalog);
      return {
        content: MessageContent.create(question.text),
        nextCurrentStep: plan.nextCurrentStep(
          input.currentStep,
          checkpointDecision,
          0,
          this.checkpoints,
        ),
        resolvedTopicSlug,
        replyMode: 'clarify',
      };
    }

    if (plan.mode === 'general') {
      const brief = this.generalOrientation.brief();
      let rawReply: string;
      try {
        rawReply = await this.llm.generate({
          systemPrompt: this.promptBuilder.buildGeneralSystemPrompt(brief.systemAppendix),
          userPrompt: this.promptBuilder.buildGeneralUserPrompt({
            userMessage: input.userMessage,
            messageHistory: input.messageHistory,
          }),
        });
      } catch {
        rawReply =
          'Estou com dificuldade técnica no momento. Tente novamente em instantes ou escolha um dos tópicos disponíveis no menu.';
      }
      if (this.guardrails.containsUnsafeOutput(rawReply)) {
        rawReply = this.guardrails.refusalMessage();
      }
      return {
        content: MessageContent.create(rawReply),
        nextCurrentStep: 0,
        resolvedTopicSlug,
        replyMode: 'general',
      };
    }

    const knowledge = await this.knowledge.retrieve({
      topicSlug: match.slug ?? persisted,
      userMessage: input.userMessage,
    }).catch(() => null);

    if (!knowledge) {
      return this.failClosed(input, persisted);
    }
    const promptStep = plan.switchOccurred ? 0 : input.currentStep;
    const nextCurrentStep = plan.nextCurrentStep(
      input.currentStep,
      checkpointDecision,
      knowledge.steps.length,
      this.checkpoints,
    );

    return this.completeRagReply(input, knowledge, promptStep, checkpointDecision, {
      nextCurrentStep,
      resolvedTopicSlug,
    });
  }

  private async completeRagReply(
    input: AssistantReplyInput,
    knowledge: KnowledgeContext,
    promptStep: number,
    checkpointDecision: ReturnType<CheckpointResponsePolicy['evaluate']>,
    result: { nextCurrentStep: number; resolvedTopicSlug: string | null },
  ): Promise<AssistantReplyResult> {
    const systemPrompt = this.promptBuilder.buildSystemPrompt();
    const userPrompt = this.promptBuilder.buildUserPrompt({
      knowledge,
      currentStep: promptStep,
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

    return {
      content: MessageContent.create(rawReply),
      nextCurrentStep: result.nextCurrentStep,
      resolvedTopicSlug: result.resolvedTopicSlug,
      replyMode: 'rag',
    };
  }

  private failClosed(
    input: AssistantReplyInput,
    persisted: string | null,
  ): AssistantReplyResult {
    return {
      content: MessageContent.create(
        'Estou com dificuldade técnica no momento. Tente novamente em instantes ou escolha um dos tópicos disponíveis no menu.',
      ),
      nextCurrentStep: input.currentStep,
      resolvedTopicSlug: persisted,
      replyMode: 'general',
    };
  }
}
