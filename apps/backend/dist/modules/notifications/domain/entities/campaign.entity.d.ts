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
export declare class Campaign {
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
    private constructor();
    static createPending(props: {
        title: string;
        body: string;
        deepLink: string;
        segmentType: CampaignSegmentType;
        segmentPayload?: string[] | null;
        requestedBy: string;
        idempotencyKey?: string | null;
    }): Campaign;
    markProcessing(): Campaign;
    markCompleted(sentCount: number, skippedCount: number): Campaign;
    static reconstitute(props: CampaignProps): Campaign;
    private toProps;
}
