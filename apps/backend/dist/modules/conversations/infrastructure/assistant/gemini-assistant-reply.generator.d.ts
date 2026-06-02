import { AssistantReplyGenerator, AssistantReplyInput, AssistantReplyResult } from '../../application/ports/assistant-reply.generator';
import { KnowledgeRetriever } from '../../application/ports/knowledge-retriever';
import { LlmProvider } from '../../application/ports/llm-provider';
export declare class GeminiAssistantReplyGenerator implements AssistantReplyGenerator {
    private readonly knowledge;
    private readonly llm;
    private readonly logger;
    private readonly guardrails;
    private readonly checkpoints;
    private readonly promptBuilder;
    constructor(knowledge: KnowledgeRetriever, llm: LlmProvider);
    generateReply(input: AssistantReplyInput): Promise<AssistantReplyResult>;
}
