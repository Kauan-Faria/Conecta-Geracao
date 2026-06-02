export type DomainErrorCode = 'CONVERSATION_NOT_FOUND' | 'CONVERSATION_CLOSED' | 'INVALID_MESSAGE_CONTENT' | 'INVALID_TOPIC_SLUG';
export declare class DomainError extends Error {
    readonly code: DomainErrorCode;
    constructor(code: DomainErrorCode, message: string);
}
export declare class ConversationNotFoundError extends DomainError {
    constructor();
}
export declare class ConversationClosedError extends DomainError {
    constructor();
}
export declare class InvalidMessageContentError extends DomainError {
    constructor(message?: string);
}
export declare class InvalidTopicSlugRefError extends DomainError {
    constructor(slug: string);
}
