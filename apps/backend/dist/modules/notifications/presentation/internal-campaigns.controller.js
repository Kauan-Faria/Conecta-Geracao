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
exports.InternalCampaignsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const send_internal_campaign_use_case_1 = require("../application/use-cases/send-internal-campaign.use-case");
const domain_errors_1 = require("../domain/errors/domain.errors");
const internal_campaign_auth_policy_1 = require("../domain/services/internal-campaign-auth.policy");
const campaign_segment_vo_1 = require("../domain/value-objects/campaign-segment.vo");
const internal_service_key_guard_1 = require("../infrastructure/auth/internal-service-key.guard");
const send_campaign_dto_1 = require("./dto/send-campaign.dto");
const campaigns_mapper_1 = require("./mappers/campaigns.mapper");
let InternalCampaignsController = class InternalCampaignsController {
    constructor(sendCampaign, authPolicy) {
        this.sendCampaign = sendCampaign;
        this.authPolicy = authPolicy;
    }
    async createCampaign(serviceKey, requestedBy, dto) {
        this.authPolicy.assertAuthorized(serviceKey);
        let segment;
        try {
            segment = campaign_segment_vo_1.CampaignSegment.create({
                type: dto.segment.type,
                firebaseUids: dto.segment.firebaseUids,
            });
        }
        catch (error) {
            if (error instanceof domain_errors_1.DomainError) {
                throw new common_1.BadRequestException({
                    error: { code: 'VALIDATION_ERROR', message: error.message },
                });
            }
            throw error;
        }
        try {
            const result = await this.sendCampaign.execute({
                title: dto.title,
                body: dto.body,
                deepLink: dto.deepLink,
                segment,
                idempotencyKey: dto.idempotencyKey,
                requestedBy: requestedBy ?? 'internal-service',
            });
            return (0, campaigns_mapper_1.toCampaignResponseDto)(result.campaign, result.idempotentReplay);
        }
        catch (error) {
            if (error instanceof domain_errors_1.DomainError) {
                throw new common_1.BadRequestException({
                    error: { code: error.code, message: error.message },
                });
            }
            throw error;
        }
    }
};
exports.InternalCampaignsController = InternalCampaignsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Disparar campanha push interna (service key)' }),
    (0, swagger_1.ApiHeader)({ name: 'X-Internal-Service-Key', required: true }),
    __param(0, (0, common_1.Headers)('x-internal-service-key')),
    __param(1, (0, common_1.Headers)('x-requested-by')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, send_campaign_dto_1.SendCampaignDto]),
    __metadata("design:returntype", Promise)
], InternalCampaignsController.prototype, "createCampaign", null);
exports.InternalCampaignsController = InternalCampaignsController = __decorate([
    (0, swagger_1.ApiTags)('notifications-internal'),
    (0, common_1.Controller)('notifications/campaigns'),
    (0, common_1.UseGuards)(internal_service_key_guard_1.InternalServiceKeyGuard),
    __metadata("design:paramtypes", [send_internal_campaign_use_case_1.SendInternalCampaignUseCase,
        internal_campaign_auth_policy_1.InternalCampaignAuthPolicy])
], InternalCampaignsController);
//# sourceMappingURL=internal-campaigns.controller.js.map