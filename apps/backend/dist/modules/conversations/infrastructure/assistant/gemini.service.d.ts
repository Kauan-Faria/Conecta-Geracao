import { LlmGenerateInput, LlmProvider } from '../../application/ports/llm-provider';
export declare class GeminiService implements LlmProvider {
    private readonly logger;
    private readonly ai;
    private readonly modelName;
    constructor();
    generate(input: LlmGenerateInput): Promise<string>;
}
