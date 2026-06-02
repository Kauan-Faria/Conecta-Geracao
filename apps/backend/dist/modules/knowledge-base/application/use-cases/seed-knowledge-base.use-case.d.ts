import { Result } from '../../../../shared/result';
import { DomainError } from '../../domain/errors/domain.errors';
import { KnowledgeContentPolicy } from '../../domain/services/knowledge-content-policy';
import { KnowledgeTopicRepository } from '../ports/knowledge-topic.repository';
export interface SeedKnowledgeBaseResult {
    seeded: number;
    skipped: boolean;
}
export declare class SeedKnowledgeBaseUseCase {
    private readonly repository;
    private readonly contentPolicy;
    constructor(repository: KnowledgeTopicRepository, contentPolicy: KnowledgeContentPolicy);
    execute(): Promise<Result<SeedKnowledgeBaseResult, DomainError>>;
}
