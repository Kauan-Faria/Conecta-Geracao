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

export function toCampaignResponseDto(
  campaign: Campaign,
  idempotentReplay = false,
): CampaignResponseDto {
  return {
    id: campaign.id!,
    status: campaign.status,
    requestedAt: campaign.requestedAt.toISOString(),
    completedAt: campaign.completedAt?.toISOString() ?? null,
    sentCount: campaign.sentCount,
    skippedCount: campaign.skippedCount,
    ...(idempotentReplay ? { idempotentReplay: true } : {}),
  };
}
