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
exports.PrismaCampaignRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../shared/prisma/prisma.service");
const campaign_entity_1 = require("../../domain/entities/campaign.entity");
let PrismaCampaignRepository = class PrismaCampaignRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(campaign) {
        const data = {
            title: campaign.title,
            body: campaign.body,
            deepLink: campaign.deepLink,
            segmentType: campaign.segmentType,
            segmentPayload: campaign.segmentPayload && campaign.segmentPayload.length > 0
                ? campaign.segmentPayload
                : undefined,
            status: campaign.status,
            requestedBy: campaign.requestedBy,
            requestedAt: campaign.requestedAt,
            completedAt: campaign.completedAt,
            sentCount: campaign.sentCount,
            skippedCount: campaign.skippedCount,
            idempotencyKey: campaign.idempotencyKey,
        };
        const row = campaign.id
            ? await this.prisma.campaign.update({ where: { id: campaign.id }, data })
            : await this.prisma.campaign.create({ data });
        return this.toEntity(row);
    }
    async findByIdempotencyKey(key, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const row = await this.prisma.campaign.findFirst({
            where: {
                idempotencyKey: key,
                requestedAt: { gte: startOfDay, lte: endOfDay },
            },
        });
        if (!row)
            return null;
        return this.toEntity(row);
    }
    toEntity(row) {
        const segmentPayload = Array.isArray(row.segmentPayload)
            ? row.segmentPayload
            : null;
        return campaign_entity_1.Campaign.reconstitute({
            id: row.id,
            title: row.title,
            body: row.body,
            deepLink: row.deepLink,
            segmentType: row.segmentType,
            segmentPayload,
            status: row.status,
            requestedBy: row.requestedBy,
            requestedAt: row.requestedAt,
            completedAt: row.completedAt,
            sentCount: row.sentCount,
            skippedCount: row.skippedCount,
            idempotencyKey: row.idempotencyKey,
        });
    }
};
exports.PrismaCampaignRepository = PrismaCampaignRepository;
exports.PrismaCampaignRepository = PrismaCampaignRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaCampaignRepository);
//# sourceMappingURL=prisma-campaign.repository.js.map