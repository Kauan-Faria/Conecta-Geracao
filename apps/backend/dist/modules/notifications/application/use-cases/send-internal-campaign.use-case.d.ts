import { Campaign } from '../../domain/entities/campaign.entity';
import { CampaignEligibilityPolicy } from '../../domain/services/campaign-eligibility.policy';
import { CampaignIdempotencyPolicy } from '../../domain/services/campaign-idempotency.policy';
import { CampaignSegment } from '../../domain/value-objects/campaign-segment.vo';
import { CampaignRepository } from '../ports/campaign.repository';
import { SendPushNotificationUseCase } from './send-push-notification.use-case';
export interface SendInternalCampaignInput {
    title: string;
    body: string;
    deepLink: string;
    segment: CampaignSegment;
    idempotencyKey?: string;
    requestedBy?: string;
}
export interface SendInternalCampaignResult {
    campaign: Campaign;
    idempotentReplay: boolean;
}
export declare class SendInternalCampaignUseCase {
    private readonly campaigns;
    private readonly idempotencyPolicy;
    private readonly eligibilityPolicy;
    private readonly sendPush;
    private readonly logger;
    constructor(campaigns: CampaignRepository, idempotencyPolicy: CampaignIdempotencyPolicy, eligibilityPolicy: CampaignEligibilityPolicy, sendPush: SendPushNotificationUseCase);
    execute(input: SendInternalCampaignInput): Promise<SendInternalCampaignResult>;
}
