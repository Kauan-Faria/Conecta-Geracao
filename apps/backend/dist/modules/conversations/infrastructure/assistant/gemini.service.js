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
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const genai_1 = require("@google/genai");
let GeminiService = GeminiService_1 = class GeminiService {
    constructor() {
        this.logger = new common_1.Logger(GeminiService_1.name);
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            throw new common_1.InternalServerErrorException('GEMINI_API_KEY não configurada no ambiente.');
        }
        this.modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash';
        this.ai = new genai_1.GoogleGenAI({ apiKey });
    }
    async generate(input) {
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Falha na chamada Gemini (${this.modelName}): ${message}`);
            throw error;
        }
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map