export type CampaignSegmentType = 'all_active' | 'uid_list';
export type CampaignStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CampaignProps {
  id?: string;
  title: string;
  body: string;
  deepLink: string;
  segmentType: CampaignSegmentType;
  segmentPayload?: string[] | null;
  status: CampaignStatus;
  requestedBy: string;
  requestedAt?: Date;
  completedAt?: Date | null;
  sentCount: number;
  skippedCount: number;
  idempotencyKey?: string | null;
}

export class Campaign {
  readonly id?: string;
  readonly title: string;
  readonly body: string;
  readonly deepLink: string;
  readonly segmentType: CampaignSegmentType;
  readonly segmentPayload: string[] | null;
  readonly status: CampaignStatus;
  readonly requestedBy: string;
  readonly requestedAt: Date;
  readonly completedAt: Date | null;
  readonly sentCount: number;
  readonly skippedCount: number;
  readonly idempotencyKey: string | null;

  private constructor(props: {
    id?: string;
    title: string;
    body: string;
    deepLink: string;
    segmentType: CampaignSegmentType;
    segmentPayload: string[] | null;
    status: CampaignStatus;
    requestedBy: string;
    requestedAt: Date;
    completedAt: Date | null;
    sentCount: number;
    skippedCount: number;
    idempotencyKey: string | null;
  }) {
    this.id = props.id;
    this.title = props.title;
    this.body = props.body;
    this.deepLink = props.deepLink;
    this.segmentType = props.segmentType;
    this.segmentPayload = props.segmentPayload;
    this.status = props.status;
    this.requestedBy = props.requestedBy;
    this.requestedAt = props.requestedAt;
    this.completedAt = props.completedAt;
    this.sentCount = props.sentCount;
    this.skippedCount = props.skippedCount;
    this.idempotencyKey = props.idempotencyKey;
  }

  static createPending(props: {
    title: string;
    body: string;
    deepLink: string;
    segmentType: CampaignSegmentType;
    segmentPayload?: string[] | null;
    requestedBy: string;
    idempotencyKey?: string | null;
  }): Campaign {
    return new Campaign({
      title: props.title,
      body: props.body,
      deepLink: props.deepLink,
      segmentType: props.segmentType,
      segmentPayload: props.segmentPayload ?? null,
      status: 'pending',
      requestedBy: props.requestedBy,
      requestedAt: new Date(),
      completedAt: null,
      sentCount: 0,
      skippedCount: 0,
      idempotencyKey: props.idempotencyKey ?? null,
    });
  }

  markProcessing(): Campaign {
    return new Campaign({ ...this.toProps(), status: 'processing' });
  }

  markCompleted(sentCount: number, skippedCount: number): Campaign {
    return new Campaign({
      ...this.toProps(),
      status: 'completed',
      completedAt: new Date(),
      sentCount,
      skippedCount,
    });
  }

  static reconstitute(props: CampaignProps): Campaign {
    return new Campaign({
      id: props.id,
      title: props.title,
      body: props.body,
      deepLink: props.deepLink,
      segmentType: props.segmentType,
      segmentPayload: props.segmentPayload ?? null,
      status: props.status,
      requestedBy: props.requestedBy,
      requestedAt: props.requestedAt ?? new Date(),
      completedAt: props.completedAt ?? null,
      sentCount: props.sentCount,
      skippedCount: props.skippedCount,
      idempotencyKey: props.idempotencyKey ?? null,
    });
  }

  private toProps() {
    return {
      id: this.id,
      title: this.title,
      body: this.body,
      deepLink: this.deepLink,
      segmentType: this.segmentType,
      segmentPayload: this.segmentPayload,
      status: this.status,
      requestedBy: this.requestedBy,
      requestedAt: this.requestedAt,
      completedAt: this.completedAt,
      sentCount: this.sentCount,
      skippedCount: this.skippedCount,
      idempotencyKey: this.idempotencyKey,
    };
  }
}
