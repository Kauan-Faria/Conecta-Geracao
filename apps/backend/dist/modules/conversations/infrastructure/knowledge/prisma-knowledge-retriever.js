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
exports.PrismaKnowledgeRetriever = void 0;
const common_1 = require("@nestjs/common");
const knowledge_topic_repository_1 = require("../../../knowledge-base/application/ports/knowledge-topic.repository");
const topic_slug_vo_1 = require("../../../knowledge-base/domain/value-objects/topic-slug.vo");
const topic_inference_policy_1 = require("../../domain/services/topic-inference.policy");
let PrismaKnowledgeRetriever = class PrismaKnowledgeRetriever {
    constructor(topics) {
        this.topics = topics;
        this.inference = new topic_inference_policy_1.TopicInferencePolicy();
    }
    async retrieve(input) {
        const allTopics = await this.topics.findAllActive();
        const availableTopics = allTopics.map((t) => ({ slug: t.slug, title: t.title }));
        let slug = input.topicSlug?.trim() || null;
        let inferredFromMessage = false;
        if (!slug) {
            slug = this.inference.inferSlug(input.userMessage, allTopics.map((t) => ({ slug: t.slug, keywords: t.keywords })));
            inferredFromMessage = Boolean(slug);
        }
        if (!slug) {
            return {
                topicSlug: null,
                topicTitle: null,
                summary: null,
                steps: [],
                availableTopics,
                inferredFromMessage: false,
            };
        }
        const topic = await this.topics.findBySlug(topic_slug_vo_1.TopicSlug.create(slug));
        if (!topic) {
            return {
                topicSlug: null,
                topicTitle: null,
                summary: null,
                steps: [],
                availableTopics,
                inferredFromMessage,
            };
        }
        return {
            topicSlug: topic.slug,
            topicTitle: topic.title,
            summary: topic.summary,
            steps: topic.steps.map((s) => ({
                order: s.order,
                instruction: s.instruction,
                checkpointQuestion: s.checkpointQuestion ?? null,
            })),
            availableTopics,
            inferredFromMessage,
        };
    }
};
exports.PrismaKnowledgeRetriever = PrismaKnowledgeRetriever;
exports.PrismaKnowledgeRetriever = PrismaKnowledgeRetriever = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(knowledge_topic_repository_1.KNOWLEDGE_TOPIC_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], PrismaKnowledgeRetriever);
//# sourceMappingURL=prisma-knowledge-retriever.js.map