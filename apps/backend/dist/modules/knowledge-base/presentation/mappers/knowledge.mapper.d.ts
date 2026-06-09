import { KnowledgeTopic } from '../../domain/entities/knowledge-topic.entity';
export interface TopicStepDto {
    order: number;
    instruction: string;
    checkpointQuestion: string | null;
    checkpointHints: string[];
}
export interface TopicSummaryDto {
    slug: string;
    title: string;
    summary: string;
    keywords: string[];
    displayOrder: number;
}
export interface TopicDetailDto extends TopicSummaryDto {
    steps: TopicStepDto[];
}
export declare function toTopicSummary(topic: KnowledgeTopic): TopicSummaryDto;
export declare function toTopicDetail(topic: KnowledgeTopic): TopicDetailDto;
