import { KnowledgeContext } from '../../application/ports/knowledge-retriever';
import { CheckpointDecision } from '../../domain/services/checkpoint-response.policy';
export interface RagPromptInput {
    knowledge: KnowledgeContext;
    currentStep: number;
    checkpointDecision: CheckpointDecision;
    userMessage: string;
    messageHistory: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
}
export declare class RagPromptBuilder {
    buildSystemPrompt(): string;
    buildUserPrompt(input: RagPromptInput): string;
    private describeActiveStep;
}
