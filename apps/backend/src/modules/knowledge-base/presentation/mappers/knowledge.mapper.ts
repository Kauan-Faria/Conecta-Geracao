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

export function toTopicSummary(topic: KnowledgeTopic): TopicSummaryDto {
  return {
    slug: topic.slug,
    title: topic.title,
    summary: topic.summary,
    keywords: topic.keywords,
    displayOrder: topic.displayOrder,
  };
}

export function toTopicDetail(topic: KnowledgeTopic): TopicDetailDto {
  return {
    ...toTopicSummary(topic),
    steps: topic.steps.map((step) => ({
      order: step.order,
      instruction: step.instruction,
      checkpointQuestion: step.checkpointQuestion ?? null,
      checkpointHints: step.checkpointHints,
    })),
  };
}
