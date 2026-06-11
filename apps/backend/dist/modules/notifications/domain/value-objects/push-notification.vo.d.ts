import { NotificationType, NotificationTypeValue } from './notification-type.vo';
export interface PushNotificationProps {
    type: NotificationTypeValue;
    title: string;
    body: string;
    deepLink: string;
    conversationId?: string;
}
export declare class PushNotification {
    readonly type: NotificationType;
    readonly title: string;
    readonly body: string;
    readonly deepLink: string;
    readonly conversationId: string | null;
    private constructor();
    static create(props: PushNotificationProps): PushNotification;
}
