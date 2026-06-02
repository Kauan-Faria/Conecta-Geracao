import { Injectable, Inject } from '@nestjs/common';
import { err, ok, Result } from '../../../../shared/result';
import { KnowledgeTopic } from '../../domain/entities/knowledge-topic.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { KnowledgeContentPolicy } from '../../domain/services/knowledge-content-policy';
import { MVP_TOPIC_SLUGS } from '../../domain/value-objects/topic-slug.vo';
import {
  KNOWLEDGE_TOPIC_REPOSITORY,
  KnowledgeTopicRepository,
} from '../ports/knowledge-topic.repository';
import { MVP_TOPICS_DATA } from '../../infrastructure/seed/mvp-topics.data';

export interface SeedKnowledgeBaseResult {
  seeded: number;
  skipped: boolean;
}

@Injectable()
export class SeedKnowledgeBaseUseCase {
  constructor(
    @Inject(KNOWLEDGE_TOPIC_REPOSITORY)
    private readonly repository: KnowledgeTopicRepository,
    private readonly contentPolicy: KnowledgeContentPolicy,
  ) {}

  async execute(): Promise<Result<SeedKnowledgeBaseResult, DomainError>> {
    try {
      const existingCount = await this.repository.countBySlugs([...MVP_TOPIC_SLUGS]);
      if (existingCount === MVP_TOPIC_SLUGS.length) {
        return ok({ seeded: 0, skipped: true });
      }

      let seeded = 0;
      for (const data of MVP_TOPICS_DATA) {
        const topic = KnowledgeTopic.create(data);
        this.contentPolicy.validateTopic(topic);
        await this.repository.upsertWithSteps(topic);
        seeded += 1;
      }

      return ok({ seeded, skipped: false });
    } catch (error) {
      if (error instanceof DomainError) {
        return err(error);
      }
      throw error;
    }
  }
}
