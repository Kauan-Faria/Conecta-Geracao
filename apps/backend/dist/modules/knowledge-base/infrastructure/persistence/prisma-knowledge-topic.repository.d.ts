import { PrismaClient } from '@prisma/client';
import { KnowledgeTopic } from '../../domain/entities/knowledge-topic.entity';
import { KnowledgeTopicRepository } from '../../application/ports/knowledge-topic.repository';
import { TopicSlug } from '../../domain/value-objects/topic-slug.vo';
export declare class PrismaKnowledgeTopicRepository implements KnowledgeTopicRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findBySlug(slug: TopicSlug): Promise<KnowledgeTopic | null>;
    findAllActive(): Promise<KnowledgeTopic[]>;
    countBySlugs(slugs: string[]): Promise<number>;
    upsertWithSteps(topic: KnowledgeTopic): Promise<void>;
    private toDomain;
}
