import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '../../application/ports/campaign.repository';
import { Campaign } from '../entities/campaign.entity';

@Injectable()
export class CampaignIdempotencyPolicy {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaigns: CampaignRepository,
  ) {}

  async findExisting(idempotencyKey: string, date: Date): Promise<Campaign | null> {
    return this.campaigns.findByIdempotencyKey(idempotencyKey, date);
  }
}
