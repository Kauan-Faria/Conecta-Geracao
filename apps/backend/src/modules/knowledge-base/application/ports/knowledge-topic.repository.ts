import { KnowledgeTopic } from '../../domain/entities/knowledge-topic.entity';
import { TopicSlug } from '../../domain/value-objects/topic-slug.vo';

export const KNOWLEDGE_TOPIC_REPOSITORY = Symbol('KNOWLEDGE_TOPIC_REPOSITORY');

export interface KnowledgeTopicRepository {
  findBySlug(slug: TopicSlug): Promise<KnowledgeTopic | null>;
  findAllActive(): Promise<KnowledgeTopic[]>;
  searchActive(query: string): Promise<KnowledgeTopic[]>;
  countBySlugs(slugs: string[]): Promise<number>;
  upsertWithSteps(topic: KnowledgeTopic): Promise<void>;
}
