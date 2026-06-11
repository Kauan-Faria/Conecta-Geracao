import { CampaignRepository } from '../../application/ports/campaign.repository';
import { Campaign } from '../entities/campaign.entity';
export declare class CampaignIdempotencyPolicy {
    private readonly campaigns;
    constructor(campaigns: CampaignRepository);
    findExisting(idempotencyKey: string, date: Date): Promise<Campaign | null>;
}
