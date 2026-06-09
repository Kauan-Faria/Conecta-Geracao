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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiAssistantReplyGenerator = void 0;
const common_1 = require("@nestjs/common");
const knowledge_retriever_1 = require("../../application/ports/knowledge-retriever");
const llm_provider_1 = require("../../application/ports/llm-provider");
const category_disambiguator_service_1 = require("../../domain/services/category-disambiguator.service");
const checkpoint_response_policy_1 = require("../../domain/services/checkpoint-response.policy");
const location_intent_classifier_1 = require("../../domain/services/location-intent.classifier");
const map_action_builder_service_1 = require("../../domain/services/map-action-builder.service");
const radius_suggestion_policy_1 = require("../../domain/services/radius-suggestion.policy");
const sensitive_content_policy_1 = require("../../domain/services/sensitive-content.policy");
const message_content_vo_1 = require("../../domain/value-objects/message-content.vo");
const rag_prompt_builder_1 = require("./rag-prompt.builder");
const location_intent_prompt_1 = require("./location-intent.prompt");
const CATEGORY_LABELS = {
    pharmacy: 'uma farmácia',
    health_post: 'um posto de saúde (UBS)',
    hospital: 'um hospital ou UPA',
    bank: 'um banco ou caixa eletrônico',
    post_office: 'uma agência dos Correios',
    supermarket: 'um supermercado',
};
let GeminiAssistantReplyGenerator = class GeminiAssistantReplyGenerator {
    constructor(knowledge, llm) {
        this.knowledge = knowledge;
        this.llm = llm;
        this.guardrails = new sensitive_content_policy_1.SensitiveContentPolicy();
        this.checkpoints = new checkpoint_response_policy_1.CheckpointResponsePolicy();
        this.promptBuilder = new rag_prompt_builder_1.RagPromptBuilder();
        this.locationIntent = new location_intent_classifier_1.LocationIntentClassifier();
        this.categoryDisambiguator = new category_disambiguator_service_1.CategoryDisambiguator();
        this.radiusPolicy = new radius_suggestion_policy_1.RadiusSuggestionPolicy();
        this.mapActionBuilder = new map_action_builder_service_1.MapActionBuilder();
    }
    async generateReply(input) {
        if (this.guardrails.containsSensitiveInput(input.userMessage)) {
            return {
                content: message_content_vo_1.MessageContent.create(this.guardrails.refusalMessage()),
                nextCurrentStep: input.currentStep,
                resolvedTopicSlug: input.topicSlug,
            };
        }
        const locationAnalysis = this.locationIntent.analyze(input.userMessage);
        if (locationAnalysis.isGeographic) {
            return this.generateGeographicReply(input, locationAnalysis.hints);
        }
        return this.generateKnowledgeReply(input);
    }
    async generateGeographicReply(input, hints) {
        const categoryResolution = this.categoryDisambiguator.resolve(input.userMessage, input.messageHistory);
        if (categoryResolution.type === 'clarification') {
            return {
                content: message_content_vo_1.MessageContent.create(categoryResolution.question),
                nextCurrentStep: input.currentStep,
                resolvedTopicSlug: input.topicSlug,
            };
        }
        if (categoryResolution.type === 'none') {
            return this.generateKnowledgeReply(input);
        }
        const radius = this.radiusPolicy.suggest(input.userMessage, hints);
        const mapAction = this.mapActionBuilder.build({
            category: categoryResolution.category,
            radius,
        });
        const categoryLabel = CATEGORY_LABELS[categoryResolution.category.value] ?? 'um lugar próximo';
        const radiusExplanation = this.radiusPolicy.explanation(radius);
        let rawReply;
        try {
            rawReply = await this.llm.generate({
                systemPrompt: `${this.promptBuilder.buildSystemPrompt()}\n\n${location_intent_prompt_1.LOCATION_INTENT_SYSTEM_APPENDIX}`,
                userPrompt: (0, location_intent_prompt_1.buildLocationReplyPrompt)({
                    categoryLabel,
                    radiusExplanation,
                    userMessage: input.userMessage,
                }),
            });
        }
        catch {
            rawReply = `Entendi! ${radiusExplanation} Vou te ajudar a encontrar ${categoryLabel}.`;
        }
        if (this.guardrails.containsUnsafeOutput(rawReply)) {
            rawReply = `Entendi! ${radiusExplanation} Vou te ajudar a encontrar ${categoryLabel}.`;
        }
        return {
            content: message_content_vo_1.MessageContent.create(rawReply),
            nextCurrentStep: input.currentStep,
            resolvedTopicSlug: input.topicSlug,
            mapAction,
        };
    }
    async generateKnowledgeReply(input) {
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
        catch {
            rawReply =
                'Estou com dificuldade técnica no momento. Tente novamente em instantes ou escolha um dos tópicos disponíveis no menu.';
        }
        if (this.guardrails.containsUnsafeOutput(rawReply)) {
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
exports.GeminiAssistantReplyGenerator = GeminiAssistantReplyGenerator = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(knowledge_retriever_1.KNOWLEDGE_RETRIEVER)),
    __param(1, (0, common_1.Inject)(llm_provider_1.LLM_PROVIDER)),
    __metadata("design:paramtypes", [Object, Object])
], GeminiAssistantReplyGenerator);
//# sourceMappingURL=gemini-assistant-reply.generator.js.map