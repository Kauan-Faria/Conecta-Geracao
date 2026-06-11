export declare class CampaignSegmentDto {
    type: 'all_active' | 'uid_list';
    firebaseUids?: string[];
}
export declare class SendCampaignDto {
    title: string;
    body: string;
    deepLink: string;
    segment: CampaignSegmentDto;
    idempotencyKey?: string;
}
