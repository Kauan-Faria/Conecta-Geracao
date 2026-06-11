import { Campaign } from '../../domain/entities/campaign.entity';
export declare const CAMPAIGN_REPOSITORY: unique symbol;
export interface CampaignRepository {
    save(campaign: Campaign): Promise<Campaign>;
    findByIdempotencyKey(key: string, date: Date): Promise<Campaign | null>;
}
