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
var SendInternalCampaignUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendInternalCampaignUseCase = void 0;
const common_1 = require("@nestjs/common");
const notification_config_1 = require("../../domain/config/notification.config");
const campaign_entity_1 = require("../../domain/entities/campaign.entity");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const campaign_eligibility_policy_1 = require("../../domain/services/campaign-eligibility.policy");
const campaign_idempotency_policy_1 = require("../../domain/services/campaign-idempotency.policy");
const campaign_repository_1 = require("../ports/campaign.repository");
const push_notification_templates_1 = require("../push-notification.templates");
const send_push_notification_use_case_1 = require("./send-push-notification.use-case");
let SendInternalCampaignUseCase = SendInternalCampaignUseCase_1 = class SendInternalCampaignUseCase {
    constructor(campaigns, idempotencyPolicy, eligibilityPolicy, sendPush) {
        this.campaigns = campaigns;
        this.idempotencyPolicy = idempotencyPolicy;
        this.eligibilityPolicy = eligibilityPolicy;
        this.sendPush = sendPush;
        this.logger = new common_1.Logger(SendInternalCampaignUseCase_1.name);
    }
    async execute(input) {
        if (input.idempotencyKey) {
            const existing = await this.idempotencyPolicy.findExisting(input.idempotencyKey, new Date());
            if (existing) {
                return { campaign: existing, idempotentReplay: true };
            }
        }
        let campaign = campaign_entity_1.Campaign.createPending({
            title: input.title,
            body: input.body,
            deepLink: input.deepLink,
            segmentType: input.segment.type,
            segmentPayload: input.segment.firebaseUids ?? undefined,
            requestedBy: input.requestedBy ?? 'internal-service',
            idempotencyKey: input.idempotencyKey ?? null,
        });
        campaign = await this.campaigns.save(campaign.markProcessing());
        const recipients = await this.eligibilityPolicy.resolveRecipients(input.segment);
        const batchLimit = (0, notification_config_1.getCampaignBatchLimit)();
        if (recipients.length > batchLimit) {
            throw new domain_errors_1.CampaignBatchLimitExceededError(batchLimit);
        }
        const notification = (0, push_notification_templates_1.buildCampaignNotification)({
            title: input.title,
            body: input.body,
            deepLink: input.deepLink,
        });
        let sentCount = 0;
        let skippedCount = 0;
        for (const firebaseUid of recipients) {
            const result = await this.sendPush.execute(firebaseUid, notification, {
                campaignId: campaign.id,
            });
            if (result.status === 'sent' || result.status === 'partial') {
                sentCount += 1;
            }
            else {
                skippedCount += 1;
            }
        }
        const completed = campaign.markCompleted(sentCount, skippedCount);
        const saved = await this.campaigns.save(completed);
        this.logger.log({
            event: 'CampaignCompleted',
            campaignId: saved.id,
            sentCount,
            skippedCount,
        });
        return { campaign: saved, idempotentReplay: false };
    }
};
exports.SendInternalCampaignUseCase = SendInternalCampaignUseCase;
exports.SendInternalCampaignUseCase = SendInternalCampaignUseCase = SendInternalCampaignUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(campaign_repository_1.CAMPAIGN_REPOSITORY)),
    __metadata("design:paramtypes", [Object, campaign_idempotency_policy_1.CampaignIdempotencyPolicy,
        campaign_eligibility_policy_1.CampaignEligibilityPolicy,
        send_push_notification_use_case_1.SendPushNotificationUseCase])
], SendInternalCampaignUseCase);
//# sourceMappingURL=send-internal-campaign.use-case.js.map