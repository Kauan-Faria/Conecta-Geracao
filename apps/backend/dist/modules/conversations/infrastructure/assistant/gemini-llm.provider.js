"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GeminiLlmProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiLlmProvider = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
let GeminiLlmProvider = GeminiLlmProvider_1 = class GeminiLlmProvider {
    constructor() {
        this.logger = new common_1.Logger(GeminiLlmProvider_1.name);
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY é obrigatória para o assistente (bolt 005).');
        }
        const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';
        const client = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = client.getGenerativeModel({ model: modelName });
    }
    async generate(input) {
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
};
exports.GeminiLlmProvider = GeminiLlmProvider;
exports.GeminiLlmProvider = GeminiLlmProvider = GeminiLlmProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GeminiLlmProvider);
//# sourceMappingURL=gemini-llm.provider.js.map