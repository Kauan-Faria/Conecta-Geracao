export declare const LLM_PROVIDER: unique symbol;
export interface LlmGenerateInput {
    systemPrompt: string;
    userPrompt: string;
}
export interface LlmProvider {
    generate(input: LlmGenerateInput): Promise<string>;
}
