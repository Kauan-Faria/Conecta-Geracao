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

export const KNOWLEDGE_RETRIEVER = Symbol('KNOWLEDGE_RETRIEVER');

export interface KnowledgeRetriever {
  retrieve(input: {
    topicSlug?: string | null;
    userMessage: string;
  }): Promise<KnowledgeContext>;
}
