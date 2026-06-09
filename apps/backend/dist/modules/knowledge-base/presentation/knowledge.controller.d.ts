import { GetTopicBySlugUseCase } from '../application/use-cases/get-topic-by-slug.use-case';
import { SearchTopicsUseCase } from '../application/use-cases/search-topics.use-case';
import { SearchKnowledgeQueryDto } from './dto/search-knowledge.query.dto';
export declare class KnowledgeController {
    private readonly getTopicBySlug;
    private readonly searchTopics;
    constructor(getTopicBySlug: GetTopicBySlugUseCase, searchTopics: SearchTopicsUseCase);
    search(query: SearchKnowledgeQueryDto): Promise<import("./mappers/knowledge.mapper").TopicSummaryDto[]>;
    getBySlug(slug: string): Promise<import("./mappers/knowledge.mapper").TopicDetailDto>;
    private mapDomainError;
}
