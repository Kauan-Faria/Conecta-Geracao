import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import {
  LlmGenerateInput,
  LlmProvider,
} from '../../application/ports/llm-provider';

@Injectable()
export class GeminiService implements LlmProvider {
  private readonly logger = new Logger(GeminiService.name);
  private readonly ai: GoogleGenAI;
  private readonly modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY não configurada no ambiente.',
      );
    }

    this.modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash';
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generate(input: LlmGenerateInput): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: input.userPrompt,
        config: {
          systemInstruction: input.systemPrompt,
        },
      });

      const text = response.text?.trim();
      if (!text) {
        this.logger.warn('Gemini retornou resposta vazia');
        return 'Desculpe, não consegui formular uma resposta agora. Pode repetir sua dúvida?';
      }

      return text;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Falha na chamada Gemini (${this.modelName}): ${message}`,
      );
      throw error;
    }
  }
}
