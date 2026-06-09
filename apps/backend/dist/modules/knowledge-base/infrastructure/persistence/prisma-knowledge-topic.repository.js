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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaKnowledgeTopicRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../shared/prisma/prisma.service");
const knowledge_topic_entity_1 = require("../../domain/entities/knowledge-topic.entity");
let PrismaKnowledgeTopicRepository = class PrismaKnowledgeTopicRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findBySlug(slug) {
        const row = await this.prisma.knowledgeTopic.findUnique({
            where: { slug: slug.value },
            include: { steps: { orderBy: { order: 'asc' } } },
        });
        if (!row)
            return null;
        return this.toDomain(row);
    }
    async findAllActive() {
        const rows = await this.prisma.knowledgeTopic.findMany({
            where: { isActive: true },
            include: { steps: { orderBy: { order: 'asc' } } },
            orderBy: { displayOrder: 'asc' },
        });
        return rows.map((row) => this.toDomain(row));
    }
    async searchActive(query) {
        const normalized = query.trim().toLowerCase();
        if (!normalized)
            return [];
        const all = await this.findAllActive();
        return all.filter((topic) => {
            if (topic.slug.includes(normalized))
                return true;
            if (topic.title.toLowerCase().includes(normalized))
                return true;
            if (topic.summary.toLowerCase().includes(normalized))
                return true;
            return topic.keywords.some((keyword) => keyword.toLowerCase().includes(normalized));
        });
    }
    async countBySlugs(slugs) {
        return this.prisma.knowledgeTopic.count({
            where: { slug: { in: slugs } },
        });
    }
    async upsertWithSteps(topic) {
        await this.prisma.$transaction(async (tx) => {
            const saved = await tx.knowledgeTopic.upsert({
                where: { slug: topic.slug },
                create: {
                    slug: topic.slug,
                    title: topic.title,
                    summary: topic.summary,
                    keywords: topic.keywords,
                    displayOrder: topic.displayOrder,
                    isActive: topic.isActive,
                },
                update: {
                    title: topic.title,
                    summary: topic.summary,
                    keywords: topic.keywords,
                    displayOrder: topic.displayOrder,
                    isActive: topic.isActive,
                },
            });
            await tx.knowledgeStep.deleteMany({ where: { topicId: saved.id } });
            await tx.knowledgeStep.createMany({
                data: topic.steps.map((step) => ({
                    topicId: saved.id,
                    order: step.order,
                    instruction: step.instruction,
                    checkpointQuestion: step.checkpointQuestion,
                    checkpointHints: step.checkpointHints,
                })),
            });
        });
    }
    toDomain(row) {
        return knowledge_topic_entity_1.KnowledgeTopic.create({
            id: row.id,
            slug: row.slug,
            title: row.title,
            summary: row.summary,
            keywords: row.keywords,
            displayOrder: row.displayOrder,
            isActive: row.isActive,
            steps: row.steps.map((s) => ({
                id: s.id,
                topicId: s.topicId,
                order: s.order,
                instruction: s.instruction,
                checkpointQuestion: s.checkpointQuestion,
                checkpointHints: s.checkpointHints,
            })),
        });
    }
};
exports.PrismaKnowledgeTopicRepository = PrismaKnowledgeTopicRepository;
exports.PrismaKnowledgeTopicRepository = PrismaKnowledgeTopicRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaKnowledgeTopicRepository);
//# sourceMappingURL=prisma-knowledge-topic.repository.js.map