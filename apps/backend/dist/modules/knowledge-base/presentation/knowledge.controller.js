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
exports.KnowledgeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const firebase_auth_guard_1 = require("../../../shared/auth/firebase-auth.guard");
const get_topic_by_slug_use_case_1 = require("../application/use-cases/get-topic-by-slug.use-case");
const search_topics_use_case_1 = require("../application/use-cases/search-topics.use-case");
const search_knowledge_query_dto_1 = require("./dto/search-knowledge.query.dto");
const knowledge_mapper_1 = require("./mappers/knowledge.mapper");
let KnowledgeController = class KnowledgeController {
    constructor(getTopicBySlug, searchTopics) {
        this.getTopicBySlug = getTopicBySlug;
        this.searchTopics = searchTopics;
    }
    async search(query) {
        const result = await this.searchTopics.execute(query.q);
        if (!result.ok)
            throw this.mapDomainError(result.error);
        return result.value.map(knowledge_mapper_1.toTopicSummary);
    }
    async getBySlug(slug) {
        const result = await this.getTopicBySlug.execute(slug);
        if (!result.ok)
            throw this.mapDomainError(result.error);
        return (0, knowledge_mapper_1.toTopicDetail)(result.value);
    }
    mapDomainError(error) {
        switch (error.code) {
            case 'TOPIC_NOT_FOUND':
                throw new common_1.NotFoundException({
                    error: { code: 'NOT_FOUND', message: error.message },
                });
            case 'INVALID_SLUG':
            case 'INVALID_SEARCH_QUERY':
                throw new common_1.BadRequestException({
                    error: { code: 'VALIDATION_ERROR', message: error.message },
                });
            default:
                throw new common_1.BadRequestException({
                    error: { code: 'VALIDATION_ERROR', message: error.message },
                });
        }
    }
};
exports.KnowledgeController = KnowledgeController;
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar tópicos por palavra-chave' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_knowledge_query_dto_1.SearchKnowledgeQueryDto]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('topics/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter tópico completo com passos ordenados' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getBySlug", null);
exports.KnowledgeController = KnowledgeController = __decorate([
    (0, swagger_1.ApiTags)('knowledge'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, common_1.Controller)('knowledge'),
    __metadata("design:paramtypes", [get_topic_by_slug_use_case_1.GetTopicBySlugUseCase,
        search_topics_use_case_1.SearchTopicsUseCase])
], KnowledgeController);
//# sourceMappingURL=knowledge.controller.js.map