import { KnowledgeTopicRepository } from '../../../knowledge-base/application/ports/knowledge-topic.repository';
import { KnowledgeContext, KnowledgeRetriever } from '../../application/ports/knowledge-retriever';
export declare class PrismaKnowledgeRetriever implements KnowledgeRetriever {
    private readonly topics;
    private readonly inference;
    constructor(topics: KnowledgeTopicRepository);
    retrieve(input: {
        topicSlug?: string | null;
        userMessage: string;
    }): Promise<KnowledgeContext>;
}
