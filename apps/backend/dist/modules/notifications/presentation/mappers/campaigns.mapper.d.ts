import { Campaign } from '../../domain/entities/campaign.entity';
export interface CampaignResponseDto {
    id: string;
    status: string;
    requestedAt: string;
    completedAt: string | null;
    sentCount: number;
    skippedCount: number;
    idempotentReplay?: boolean;
}
export declare function toCampaignResponseDto(campaign: Campaign, idempotentReplay?: boolean): CampaignResponseDto;
