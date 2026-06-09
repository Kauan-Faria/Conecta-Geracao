import { Injectable, Inject } from '@nestjs/common';
import { err, ok, Result } from '../../../../shared/result';
import { KnowledgeTopic } from '../../domain/entities/knowledge-topic.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { SearchQuery } from '../../domain/value-objects/search-query.vo';
import {
  KNOWLEDGE_TOPIC_REPOSITORY,
  KnowledgeTopicRepository,
} from '../ports/knowledge-topic.repository';

@Injectable()
export class SearchTopicsUseCase {
  constructor(
    @Inject(KNOWLEDGE_TOPIC_REPOSITORY)
    private readonly repository: KnowledgeTopicRepository,
  ) {}

  async execute(rawQuery: string): Promise<Result<KnowledgeTopic[], DomainError>> {
    try {
      const query = SearchQuery.create(rawQuery);
      const topics = await this.repository.searchActive(query.value);
      return ok(topics);
    } catch (error) {
      if (error instanceof DomainError) {
        return err(error);
      }
      throw error;
    }
  }
}
