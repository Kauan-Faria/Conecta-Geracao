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
exports.SeedKnowledgeBaseUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../shared/result");
const knowledge_topic_entity_1 = require("../../domain/entities/knowledge-topic.entity");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const knowledge_content_policy_1 = require("../../domain/services/knowledge-content-policy");
const topic_slug_vo_1 = require("../../domain/value-objects/topic-slug.vo");
const knowledge_topic_repository_1 = require("../ports/knowledge-topic.repository");
const mvp_topics_data_1 = require("../../infrastructure/seed/mvp-topics.data");
let SeedKnowledgeBaseUseCase = class SeedKnowledgeBaseUseCase {
    constructor(repository, contentPolicy) {
        this.repository = repository;
        this.contentPolicy = contentPolicy;
    }
    async execute() {
        try {
            const existingCount = await this.repository.countBySlugs([...topic_slug_vo_1.MVP_TOPIC_SLUGS]);
            if (existingCount === topic_slug_vo_1.MVP_TOPIC_SLUGS.length) {
                return (0, result_1.ok)({ seeded: 0, skipped: true });
            }
            let seeded = 0;
            for (const data of mvp_topics_data_1.MVP_TOPICS_DATA) {
                const topic = knowledge_topic_entity_1.KnowledgeTopic.create(data);
                this.contentPolicy.validateTopic(topic);
                await this.repository.upsertWithSteps(topic);
                seeded += 1;
            }
            return (0, result_1.ok)({ seeded, skipped: false });
        }
        catch (error) {
            if (error instanceof domain_errors_1.DomainError) {
                return (0, result_1.err)(error);
            }
            throw error;
        }
    }
};
exports.SeedKnowledgeBaseUseCase = SeedKnowledgeBaseUseCase;
exports.SeedKnowledgeBaseUseCase = SeedKnowledgeBaseUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(knowledge_topic_repository_1.KNOWLEDGE_TOPIC_REPOSITORY)),
    __metadata("design:paramtypes", [Object, knowledge_content_policy_1.KnowledgeContentPolicy])
], SeedKnowledgeBaseUseCase);
//# sourceMappingURL=seed-knowledge-base.use-case.js.map