import { TopicMatch } from '../../domain/value-objects/topic-match.vo';

export interface KnowledgeStepContext {
  order: number;
  instruction: string;
  checkpointQuestion: string | null;
}

export interface KnowledgeTopicSummary {
  slug: string;
  title: string;
}

export interface KnowledgeContext {
  topicSlug: string | null;
  topicTitle: string | null;
  summary: string | null;
  steps: KnowledgeStepContext[];
  availableTopics: KnowledgeTopicSummary[];
  inferredFromMessage: boolean;
}

export interface InferredTopicResult {
  match: TopicMatch;
  catalog: KnowledgeTopicSummary[];
}

export const KNOWLEDGE_RETRIEVER = Symbol('KNOWLEDGE_RETRIEVER');

export interface KnowledgeRetriever {
  inferMatch(userMessage: string): Promise<InferredTopicResult>;
  retrieve(input: {
    topicSlug?: string | null;
    userMessage: string;
  }): Promise<KnowledgeContext>;
}
