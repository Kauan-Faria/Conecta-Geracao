export type NotificationTypeValue = 'reminder' | 'ai_response' | 'tip' | 'campaign';
export declare class NotificationType {
    readonly value: NotificationTypeValue;
    private constructor();
    static reminder(): NotificationType;
    static aiResponse(): NotificationType;
    static tip(): NotificationType;
    static campaign(): NotificationType;
    static create(raw: string): NotificationType;
}
