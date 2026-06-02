export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

export interface LlmGenerateInput {
  systemPrompt: string;
  userPrompt: string;
}

export interface LlmProvider {
  generate(input: LlmGenerateInput): Promise<string>;
}
