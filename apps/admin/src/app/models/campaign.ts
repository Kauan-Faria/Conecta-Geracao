export type CampaignSegmentType =
  | 'all_active'
  | 'uid_list';

export type CampaignStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

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