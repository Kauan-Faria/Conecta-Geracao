import { Inject, Injectable } from '@nestjs/common';
import {
  KNOWLEDGE_TOPIC_REPOSITORY,
  KnowledgeTopicRepository,
} from '../../../knowledge-base/application/ports/knowledge-topic.repository';
import { TopicSlug } from '../../../knowledge-base/domain/value-objects/topic-slug.vo';
import {
  KnowledgeContext,
  KnowledgeRetriever,
} from '../../application/ports/knowledge-retriever';
import { TopicInferencePolicy } from '../../domain/services/topic-inference.policy';

@Injectable()
export class PrismaKnowledgeRetriever implements KnowledgeRetriever {
  private readonly inference = new TopicInferencePolicy();

  constructor(
    @Inject(KNOWLEDGE_TOPIC_REPOSITORY)
    private readonly topics: KnowledgeTopicRepository,
  ) {}

  async retrieve(input: {
    topicSlug?: string | null;
    userMessage: string;
  }): Promise<KnowledgeContext> {
    const allTopics = await this.topics.findAllActive();
    const availableTopics = allTopics.map((t) => ({ slug: t.slug, title: t.title }));

    let slug = input.topicSlug?.trim() || null;
    let inferredFromMessage = false;

    if (!slug) {
      slug = this.inference.inferSlug(
        input.userMessage,
        allTopics.map((t) => ({ slug: t.slug, keywords: t.keywords })),
      );
      inferredFromMessage = Boolean(slug);
    }

    if (!slug) {
      return {
        topicSlug: null,
        topicTitle: null,
        summary: null,
        steps: [],
        availableTopics,
        inferredFromMessage: false,
      };
    }

    const topic = await this.topics.findBySlug(TopicSlug.create(slug));
    if (!topic) {
      return {
        topicSlug: null,
        topicTitle: null,
        summary: null,
        steps: [],
        availableTopics,
        inferredFromMessage,
      };
    }

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
