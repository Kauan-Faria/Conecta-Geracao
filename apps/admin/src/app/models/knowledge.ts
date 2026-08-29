export interface KnowledgeStep {
  id: string;
  order: number;
  instruction: string;
  checkpointQuestion: string | null;
  checkpointHints: string[];
}

export interface KnowledgeTopic {
  id: string;
  slug: string;
  title: string;
  summary: string;
  keywords: string[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  steps: KnowledgeStep[];
}