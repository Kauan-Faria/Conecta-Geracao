import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { KnowledgeTopic } from '../../domain/entities/knowledge-topic.entity';
import { KnowledgeTopicRepository } from '../../application/ports/knowledge-topic.repository';
import { TopicSlug } from '../../domain/value-objects/topic-slug.vo';
export declare class PrismaKnowledgeTopicRepository implements KnowledgeTopicRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findBySlug(slug: TopicSlug): Promise<KnowledgeTopic | null>;
    findAllActive(): Promise<KnowledgeTopic[]>;
    searchActive(query: string): Promise<KnowledgeTopic[]>;
    countBySlugs(slugs: string[]): Promise<number>;
    upsertWithSteps(topic: KnowledgeTopic): Promise<void>;
    private toDomain;
}
