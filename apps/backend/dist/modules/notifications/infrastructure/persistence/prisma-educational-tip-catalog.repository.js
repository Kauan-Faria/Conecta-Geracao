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
exports.PrismaEducationalTipCatalogRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../shared/prisma/prisma.service");
const educational_tip_entity_1 = require("../../domain/entities/educational-tip.entity");
let PrismaEducationalTipCatalogRepository = class PrismaEducationalTipCatalogRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllActive() {
        const rows = await this.prisma.educationalTip.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
        return rows.map((row) => educational_tip_entity_1.EducationalTip.reconstitute({
            id: row.id,
            title: row.title,
            body: row.body,
            deepLink: row.deepLink,
            topicTag: row.topicTag,
            isActive: row.isActive,
            sortOrder: row.sortOrder,
        }));
    }
    async findById(id) {
        const row = await this.prisma.educationalTip.findUnique({ where: { id } });
        if (!row)
            return null;
        return educational_tip_entity_1.EducationalTip.reconstitute({
            id: row.id,
            title: row.title,
            body: row.body,
            deepLink: row.deepLink,
            topicTag: row.topicTag,
            isActive: row.isActive,
            sortOrder: row.sortOrder,
        });
    }
};
exports.PrismaEducationalTipCatalogRepository = PrismaEducationalTipCatalogRepository;
exports.PrismaEducationalTipCatalogRepository = PrismaEducationalTipCatalogRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaEducationalTipCatalogRepository);
//# sourceMappingURL=prisma-educational-tip-catalog.repository.js.map