import { NotificationTypeValue } from '../value-objects/notification-type.vo';
export type DeliveryLogStatus = 'sent' | 'skipped';
export interface NotificationDeliveryLogProps {
    id?: string;
    firebaseUid: string;
    conversationId?: string | null;
    notificationType: NotificationTypeValue;
    status: DeliveryLogStatus;
    fcmMessageId?: string | null;
    skippedReason?: string | null;
    sentAt?: Date;
}
export declare class NotificationDeliveryLog {
    readonly id?: string;
    readonly firebaseUid: string;
    readonly conversationId: string | null;
    readonly notificationType: NotificationTypeValue;
    readonly status: DeliveryLogStatus;
    readonly fcmMessageId: string | null;
    readonly skippedReason: string | null;
    readonly sentAt: Date;
    private constructor();
    static createSent(props: {
        firebaseUid: string;
        conversationId?: string | null;
        notificationType: NotificationTypeValue;
        fcmMessageId?: string | null;
    }): NotificationDeliveryLog;
    static createSkipped(props: {
        firebaseUid: string;
        conversationId?: string | null;
        notificationType: NotificationTypeValue;
        skippedReason: string;
    }): NotificationDeliveryLog;
    static reconstitute(props: NotificationDeliveryLogProps): NotificationDeliveryLog;
}
