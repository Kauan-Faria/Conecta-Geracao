import { LlmProvider } from '../../application/ports/llm-provider';
export declare class GeminiLlmProvider implements LlmProvider {
    private readonly logger;
    private readonly model;
    constructor();
    generate(input: {
        systemPrompt: string;
        userPrompt: string;
    }): Promise<string>;
}
