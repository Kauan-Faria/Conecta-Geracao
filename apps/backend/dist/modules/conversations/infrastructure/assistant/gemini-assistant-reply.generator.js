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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GeminiAssistantReplyGenerator_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiAssistantReplyGenerator = void 0;
const common_1 = require("@nestjs/common");
const knowledge_retriever_1 = require("../../application/ports/knowledge-retriever");
const llm_provider_1 = require("../../application/ports/llm-provider");
const checkpoint_response_policy_1 = require("../../domain/services/checkpoint-response.policy");
const sensitive_content_policy_1 = require("../../domain/services/sensitive-content.policy");
const message_content_vo_1 = require("../../domain/value-objects/message-content.vo");
const rag_prompt_builder_1 = require("./rag-prompt.builder");
let GeminiAssistantReplyGenerator = GeminiAssistantReplyGenerator_1 = class GeminiAssistantReplyGenerator {
    constructor(knowledge, llm) {
        this.knowledge = knowledge;
        this.llm = llm;
        this.logger = new common_1.Logger(GeminiAssistantReplyGenerator_1.name);
        this.guardrails = new sensitive_content_policy_1.SensitiveContentPolicy();
        this.checkpoints = new checkpoint_response_policy_1.CheckpointResponsePolicy();
        this.promptBuilder = new rag_prompt_builder_1.RagPromptBuilder();
    }
    async generateReply(input) {
        if (this.guardrails.containsSensitiveInput(input.userMessage)) {
            this.logger.warn(`Input sensível bloqueado (conversa=${input.conversationId}): ${this.guardrails.sanitizeForLog(input.userMessage)}`);
            return {
                content: message_content_vo_1.MessageContent.create(this.guardrails.refusalMessage()),
                nextCurrentStep: input.currentStep,
                resolvedTopicSlug: input.topicSlug,
            };
        }
        const knowledge = await this.knowledge.retrieve({
            topicSlug: input.topicSlug,
            userMessage: input.userMessage,
        });
        const stepCount = knowledge.steps.length;
        const checkpointDecision = this.checkpoints.evaluate(input.userMessage);
        const nextCurrentStep = this.checkpoints.resolveNextStep(input.currentStep, checkpointDecision, stepCount);
        const systemPrompt = this.promptBuilder.buildSystemPrompt();
        const userPrompt = this.promptBuilder.buildUserPrompt({
            knowledge,
            currentStep: input.currentStep,
            checkpointDecision,
            userMessage: input.userMessage,
            messageHistory: input.messageHistory,
        });
        let rawReply;
        try {
            rawReply = await this.llm.generate({ systemPrompt, userPrompt });
        }
        catch (error) {
            this.logger.error(`Falha ao chamar Gemini (conversa=${input.conversationId})`, error instanceof Error ? error.message : error);
            rawReply =
                'Estou com dificuldade técnica no momento. Tente novamente em instantes ou escolha um dos tópicos disponíveis no menu.';
        }
        if (this.guardrails.containsUnsafeOutput(rawReply)) {
            this.logger.warn(`Saída insegura substituída (conversa=${input.conversationId})`);
            rawReply = this.guardrails.refusalMessage();
        }
        if (!knowledge.topicSlug && knowledge.availableTopics.length > 0) {
            const list = knowledge.availableTopics.map((t) => `• ${t.title}`).join('\n');
            rawReply = `${rawReply}\n\nPosso ajudar com estes assuntos:\n${list}`;
        }
        const resolvedTopicSlug = input.topicSlug ?? (knowledge.inferredFromMessage ? knowledge.topicSlug : null);
        return {
            content: message_content_vo_1.MessageContent.create(rawReply),
            nextCurrentStep,
            resolvedTopicSlug,
        };
    }
};
exports.GeminiAssistantReplyGenerator = GeminiAssistantReplyGenerator;
exports.GeminiAssistantReplyGenerator = GeminiAssistantReplyGenerator = GeminiAssistantReplyGenerator_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(knowledge_retriever_1.KNOWLEDGE_RETRIEVER)),
    __param(1, (0, common_1.Inject)(llm_provider_1.LLM_PROVIDER)),
    __metadata("design:paramtypes", [Object, Object])
], GeminiAssistantReplyGenerator);
//# sourceMappingURL=gemini-assistant-reply.generator.js.map