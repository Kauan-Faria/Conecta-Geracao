export type CampaignSegmentType = string;
export type CampaignStatus = string;

export interface Campaign {
  id: string;
  title: string;
  body: string;
  deepLink: string;
  segmentType: CampaignSegmentType;
  status: CampaignStatus;
  requestedBy: string;
  requestedAt: string;
  completedAt: string | null;
  sentCount: number | null;
  skippedCount: number | null;
}

export interface CampaignPayload {
  title: string;
  body: string;
  deepLink: string;
  segmentType: CampaignSegmentType;
  firebaseUids?: string[];
  idempotencyKey?: string;
}