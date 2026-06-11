import { PushNotificationProvider } from '../../application/ports/push-notification.provider';
import { PushNotification } from '../../domain/value-objects/push-notification.vo';
export declare class NoOpPushNotificationProvider implements PushNotificationProvider {
    private readonly logger;
    send(firebaseUid: string, notification: PushNotification): Promise<import("../../application/ports/push-notification.provider").SendResult>;
}
