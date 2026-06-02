import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LlmProvider } from '../../application/ports/llm-provider';

@Injectable()
export class GeminiLlmProvider implements LlmProvider {
  private readonly logger = new Logger(GeminiLlmProvider.name);
  private readonly model;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY é obrigatória para o assistente (bolt 005).');
    }
    const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';
    const client = new GoogleGenerativeAI(apiKey);
    this.model = client.getGenerativeModel({ model: modelName });
  }

  async generate(input: { systemPrompt: string; userPrompt: string }): Promise<string> {
    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: input.userPrompt }] }],
      systemInstruction: input.systemPrompt,
    });

    const text = result.response.text()?.trim();
    if (!text) {
      this.logger.warn('Gemini retornou resposta vazia');
      return 'Desculpe, não consegui formular uma resposta agora. Pode repetir sua dúvida?';
    }
    return text;
  }
}
