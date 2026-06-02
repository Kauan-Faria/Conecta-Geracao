"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBaseModule = void 0;
const common_1 = require("@nestjs/common");
const knowledge_content_policy_1 = require("./domain/services/knowledge-content-policy");
const knowledge_topic_repository_1 = require("./application/ports/knowledge-topic.repository");
const prisma_knowledge_topic_repository_1 = require("./infrastructure/persistence/prisma-knowledge-topic.repository");
const seed_knowledge_base_use_case_1 = require("./application/use-cases/seed-knowledge-base.use-case");
const get_topic_by_slug_use_case_1 = require("./application/use-cases/get-topic-by-slug.use-case");
let KnowledgeBaseModule = class KnowledgeBaseModule {
};
exports.KnowledgeBaseModule = KnowledgeBaseModule;
exports.KnowledgeBaseModule = KnowledgeBaseModule = __decorate([
    (0, common_1.Module)({
        providers: [
            knowledge_content_policy_1.KnowledgeContentPolicy,
            {
                provide: knowledge_topic_repository_1.KNOWLEDGE_TOPIC_REPOSITORY,
                useClass: prisma_knowledge_topic_repository_1.PrismaKnowledgeTopicRepository,
            },
            seed_knowledge_base_use_case_1.SeedKnowledgeBaseUseCase,
            get_topic_by_slug_use_case_1.GetTopicBySlugUseCase,
        ],
        exports: [
            knowledge_topic_repository_1.KNOWLEDGE_TOPIC_REPOSITORY,
            seed_knowledge_base_use_case_1.SeedKnowledgeBaseUseCase,
            get_topic_by_slug_use_case_1.GetTopicBySlugUseCase,
        ],
    })
], KnowledgeBaseModule);
//# sourceMappingURL=knowledge-base.module.js.map