import { KnowledgeTopic } from '../../domain/entities/knowledge-topic.entity';
import { TopicSlug } from '../../domain/value-objects/topic-slug.vo';
export declare const KNOWLEDGE_TOPIC_REPOSITORY: unique symbol;
export interface KnowledgeTopicRepository {
    findBySlug(slug: TopicSlug): Promise<KnowledgeTopic | null>;
    findAllActive(): Promise<KnowledgeTopic[]>;
    countBySlugs(slugs: string[]): Promise<number>;
    upsertWithSteps(topic: KnowledgeTopic): Promise<void>;
}
