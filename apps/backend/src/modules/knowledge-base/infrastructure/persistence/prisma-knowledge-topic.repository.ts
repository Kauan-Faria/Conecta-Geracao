import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { KnowledgeTopic } from '../../domain/entities/knowledge-topic.entity';
import { KnowledgeTopicRepository } from '../../application/ports/knowledge-topic.repository';
import { TopicSlug } from '../../domain/value-objects/topic-slug.vo';

@Injectable()
export class PrismaKnowledgeTopicRepository implements KnowledgeTopicRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBySlug(slug: TopicSlug): Promise<KnowledgeTopic | null> {
    const row = await this.prisma.knowledgeTopic.findUnique({
      where: { slug: slug.value },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAllActive(): Promise<KnowledgeTopic[]> {
    const rows = await this.prisma.knowledgeTopic.findMany({
      where: { isActive: true },
      include: { steps: { orderBy: { order: 'asc' } } },
      orderBy: { displayOrder: 'asc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async countBySlugs(slugs: string[]): Promise<number> {
    return this.prisma.knowledgeTopic.count({
      where: { slug: { in: slugs } },
    });
  }

  async upsertWithSteps(topic: KnowledgeTopic): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const saved = await tx.knowledgeTopic.upsert({
        where: { slug: topic.slug },
        create: {
          slug: topic.slug,
          title: topic.title,
          summary: topic.summary,
          keywords: topic.keywords,
          displayOrder: topic.displayOrder,
          isActive: topic.isActive,
        },
        update: {
          title: topic.title,
          summary: topic.summary,
          keywords: topic.keywords,
          displayOrder: topic.displayOrder,
          isActive: topic.isActive,
        },
      });

      await tx.knowledgeStep.deleteMany({ where: { topicId: saved.id } });

      await tx.knowledgeStep.createMany({
        data: topic.steps.map((step) => ({
          topicId: saved.id,
          order: step.order,
          instruction: step.instruction,
          checkpointQuestion: step.checkpointQuestion,
          checkpointHints: step.checkpointHints,
        })),
      });
    });
  }

  private toDomain(row: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    keywords: string[];
    displayOrder: number;
    isActive: boolean;
    steps: Array<{
      id: string;
      topicId: string;
      order: number;
      instruction: string;
      checkpointQuestion: string | null;
      checkpointHints: string[];
    }>;
  }): KnowledgeTopic {
    return KnowledgeTopic.create({
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      keywords: row.keywords,
      displayOrder: row.displayOrder,
      isActive: row.isActive,
      steps: row.steps.map((s) => ({
        id: s.id,
        topicId: s.topicId,
        order: s.order,
        instruction: s.instruction,
        checkpointQuestion: s.checkpointQuestion,
        checkpointHints: s.checkpointHints,
      })),
    });
  }
}
