export type DomainErrorCode = 'INVALID_FCM_TOKEN' | 'INVALID_DEVICE_PLATFORM' | 'INVALID_FIREBASE_UID' | 'INVALID_PUSH_NOTIFICATION' | 'INVALID_CAMPAIGN_SEGMENT' | 'DYNAMIC_CONTENT_NOT_ALLOWED' | 'CAMPAIGN_BATCH_LIMIT_EXCEEDED';
export declare class DomainError extends Error {
    readonly code: DomainErrorCode;
    constructor(code: DomainErrorCode, message: string);
}
export declare class InvalidFcmTokenError extends DomainError {
    constructor(message?: string);
}
export declare class InvalidDevicePlatformError extends DomainError {
    constructor(platform: string);
}
export declare class InvalidFirebaseUidError extends DomainError {
    constructor(message?: string);
}
export declare class InvalidPushNotificationError extends DomainError {
    constructor(message: string);
}
export declare class InvalidCampaignSegmentError extends DomainError {
    constructor(message: string);
}
export declare class DynamicContentNotAllowedError extends DomainError {
    constructor(message?: string);
}
export declare class CampaignBatchLimitExceededError extends DomainError {
    constructor(limit: number);
}
