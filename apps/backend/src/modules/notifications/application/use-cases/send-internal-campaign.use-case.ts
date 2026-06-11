import { Inject, Injectable, Logger } from '@nestjs/common';
import { getCampaignBatchLimit } from '../../domain/config/notification.config';
import { Campaign } from '../../domain/entities/campaign.entity';
import { CampaignBatchLimitExceededError } from '../../domain/errors/domain.errors';
import { CampaignEligibilityPolicy } from '../../domain/services/campaign-eligibility.policy';
import { CampaignIdempotencyPolicy } from '../../domain/services/campaign-idempotency.policy';
import { CampaignSegment } from '../../domain/value-objects/campaign-segment.vo';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '../ports/campaign.repository';
import { buildCampaignNotification } from '../push-notification.templates';
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

@Injectable()
export class SendInternalCampaignUseCase {
  private readonly logger = new Logger(SendInternalCampaignUseCase.name);

  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaigns: CampaignRepository,
    private readonly idempotencyPolicy: CampaignIdempotencyPolicy,
    private readonly eligibilityPolicy: CampaignEligibilityPolicy,
    private readonly sendPush: SendPushNotificationUseCase,
  ) {}

  async execute(input: SendInternalCampaignInput): Promise<SendInternalCampaignResult> {
    if (input.idempotencyKey) {
      const existing = await this.idempotencyPolicy.findExisting(
        input.idempotencyKey,
        new Date(),
      );
      if (existing) {
        return { campaign: existing, idempotentReplay: true };
      }
    }

    let campaign = Campaign.createPending({
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
    const batchLimit = getCampaignBatchLimit();

    if (recipients.length > batchLimit) {
      throw new CampaignBatchLimitExceededError(batchLimit);
    }

    const notification = buildCampaignNotification({
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
      } else {
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
}
