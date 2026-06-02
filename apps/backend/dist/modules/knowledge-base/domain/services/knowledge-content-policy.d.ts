import { KnowledgeTopic } from '../entities/knowledge-topic.entity';
export declare class KnowledgeContentPolicy {
    validateTopic(topic: KnowledgeTopic): void;
    validateStepText(text: string, slug: string): void;
}
