import { Campaign } from '../../domain/entities/campaign.entity';

export const CAMPAIGN_REPOSITORY = Symbol('CAMPAIGN_REPOSITORY');

export interface CampaignRepository {
  save(campaign: Campaign): Promise<Campaign>;
  findByIdempotencyKey(key: string, date: Date): Promise<Campaign | null>;
}
