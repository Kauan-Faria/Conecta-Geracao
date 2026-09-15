import { Inject, Injectable } from '@nestjs/common';
import {
  KNOWLEDGE_TOPIC_REPOSITORY,
  KnowledgeTopicRepository,
} from '../../../knowledge-base/application/ports/knowledge-topic.repository';
import { KnowledgeTopic } from '../../../knowledge-base/domain/entities/knowledge-topic.entity';
import { TopicSlug } from '../../../knowledge-base/domain/value-objects/topic-slug.vo';
import {
  KnowledgeContext,
  KnowledgeRetriever,
  KnowledgeTopicSummary,
} from '../../application/ports/knowledge-retriever';
import { TopicInferencePolicy } from '../../domain/services/topic-inference.policy';
import { TopicMatch } from '../../domain/value-objects/topic-match.vo';

@Injectable()
export class PrismaKnowledgeRetriever implements KnowledgeRetriever {
  private readonly inference = new TopicInferencePolicy();

  constructor(
    @Inject(KNOWLEDGE_TOPIC_REPOSITORY)
    private readonly topics: KnowledgeTopicRepository,
  ) {}

  async inferMatch(userMessage: string) {
    const allTopics = await this.topics.findAllActive();
    const catalog = allTopics.map((t) => ({ slug: t.slug, title: t.title }));
    const match = this.inference.infer(
      userMessage,
      allTopics.map((t) => ({ slug: t.slug, keywords: t.keywords, aliases: t.aliases })),
    );
    return { match, catalog };
  }

  async retrieve(input: {
    topicSlug?: string | null;
    userMessage: string;
  }): Promise<KnowledgeContext> {
    const allTopics = await this.topics.findAllActive();
    const availableTopics = allTopics.map((t) => ({ slug: t.slug, title: t.title }));
    const persistedSlug = input.topicSlug?.trim() || null;

    const match = this.inference.infer(
      input.userMessage,
      allTopics.map((t) => ({ slug: t.slug, keywords: t.keywords, aliases: t.aliases })),
    );

    const selectedSlug = this.resolveSlug(match, persistedSlug);
    if (!selectedSlug) {
      return this.emptyContext(availableTopics, false);
    }

    const topic = await this.topics.findBySlug(TopicSlug.create(selectedSlug));
    if (!topic) {
      return this.emptyContext(availableTopics, match.isHigh);
    }

    const inferredFromMessage = match.isHigh && match.slug !== persistedSlug;

    return this.contextFromTopic(topic, availableTopics, inferredFromMessage);
  }

  /**
   * ADR-015: mensagem atual manda. Persistido só continua se não houver
   * outro high e se não for tie/low (não chutar o tópico antigo).
   */
  private resolveSlug(match: TopicMatch, persistedSlug: string | null): string | null {
    if (match.confidence === 'high' && match.slug) {
      return match.slug;
    }
    if (match.confidence === 'tie' || match.confidence === 'low') {
      return null;
    }
    return persistedSlug;
  }

  private emptyContext(
    availableTopics: KnowledgeTopicSummary[],
    inferredFromMessage: boolean,
  ): KnowledgeContext {
    return {
      topicSlug: null,
      topicTitle: null,
      summary: null,
      steps: [],
      availableTopics,
      inferredFromMessage,
    };
  }

  private contextFromTopic(
    topic: KnowledgeTopic,
    availableTopics: KnowledgeTopicSummary[],
    inferredFromMessage: boolean,
  ): KnowledgeContext {
    return {
      topicSlug: topic.slug,
      topicTitle: topic.title,
      summary: topic.summary,
      steps: topic.steps.map((s) => ({
        order: s.order,
        instruction: s.instruction,
        checkpointQuestion: s.checkpointQuestion ?? null,
      })),
      availableTopics,
      inferredFromMessage,
    };
  }
}
