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
exports.SearchTopicsUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../shared/result");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const search_query_vo_1 = require("../../domain/value-objects/search-query.vo");
const knowledge_topic_repository_1 = require("../ports/knowledge-topic.repository");
let SearchTopicsUseCase = class SearchTopicsUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(rawQuery) {
        try {
            const query = search_query_vo_1.SearchQuery.create(rawQuery);
            const topics = await this.repository.searchActive(query.value);
            return (0, result_1.ok)(topics);
        }
        catch (error) {
            if (error instanceof domain_errors_1.DomainError) {
                return (0, result_1.err)(error);
            }
            throw error;
        }
    }
};
exports.SearchTopicsUseCase = SearchTopicsUseCase;
exports.SearchTopicsUseCase = SearchTopicsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(knowledge_topic_repository_1.KNOWLEDGE_TOPIC_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], SearchTopicsUseCase);
//# sourceMappingURL=search-topics.use-case.js.map