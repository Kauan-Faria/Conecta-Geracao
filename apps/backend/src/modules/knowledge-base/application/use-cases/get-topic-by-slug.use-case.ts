import { Injectable, Inject } from '@nestjs/common';
import { err, ok, Result } from '../../../../shared/result';
import { KnowledgeTopic } from '../../domain/entities/knowledge-topic.entity';
import { DomainError, TopicNotFoundError } from '../../domain/errors/domain.errors';
import { TopicSlug } from '../../domain/value-objects/topic-slug.vo';
import {
  KNOWLEDGE_TOPIC_REPOSITORY,
  KnowledgeTopicRepository,
} from '../ports/knowledge-topic.repository';

@Injectable()
export class GetTopicBySlugUseCase {
  constructor(
    @Inject(KNOWLEDGE_TOPIC_REPOSITORY)
    private readonly repository: KnowledgeTopicRepository,
  ) {}

  async execute(rawSlug: string): Promise<Result<KnowledgeTopic, DomainError>> {
    try {
      const slug = TopicSlug.create(rawSlug);
      const topic = await this.repository.findBySlug(slug);
      if (!topic) {
        return err(new TopicNotFoundError(rawSlug));
      }
      return ok(topic);
    } catch (error) {
      if (error instanceof DomainError) {
        return err(error);
      }
      throw error;
    }
  }
}
