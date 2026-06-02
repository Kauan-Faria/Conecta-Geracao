import { Result } from '../../../../shared/result';
import { KnowledgeTopic } from '../../domain/entities/knowledge-topic.entity';
import { DomainError } from '../../domain/errors/domain.errors';
import { KnowledgeTopicRepository } from '../ports/knowledge-topic.repository';
export declare class GetTopicBySlugUseCase {
    private readonly repository;
    constructor(repository: KnowledgeTopicRepository);
    execute(rawSlug: string): Promise<Result<KnowledgeTopic, DomainError>>;
}
