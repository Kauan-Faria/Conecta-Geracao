export type CampaignSegmentType = 'all_active' | 'uid_list';
export interface CampaignSegmentProps {
    type: CampaignSegmentType;
    firebaseUids?: string[];
}
export declare class CampaignSegment {
    readonly type: CampaignSegmentType;
    readonly firebaseUids: string[] | null;
    private constructor();
    static create(props: CampaignSegmentProps): CampaignSegment;
}
