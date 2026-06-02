export type DomainErrorCode = 'INVALID_SLUG' | 'CONTENT_POLICY' | 'DUPLICATE_SLUG' | 'TOPIC_NOT_FOUND';
export declare class DomainError extends Error {
    readonly code: DomainErrorCode;
    constructor(code: DomainErrorCode, message: string);
}
export declare class InvalidTopicSlugError extends DomainError {
    constructor(slug: string);
}
export declare class ContentPolicyViolationError extends DomainError {
    constructor(message: string);
}
export declare class TopicNotFoundError extends DomainError {
    constructor(slug: string);
}
