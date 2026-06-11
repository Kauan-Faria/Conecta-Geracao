import { NotificationTypeValue } from './notification-type.vo';
export interface NotificationSentEventProps {
    notificationType: NotificationTypeValue;
    occurredAt: Date;
    campaignId?: string;
    tipId?: string;
}
export declare class NotificationSentEvent {
    readonly notificationType: NotificationTypeValue;
    readonly occurredAt: Date;
    readonly campaignId?: string;
    readonly tipId?: string;
    private constructor();
    static create(props: NotificationSentEventProps): NotificationSentEvent;
    toLogPayload(): Record<string, string>;
}
