import type { App } from 'firebase-admin/app';
import { DeviceTokenRepository } from '../../application/ports/device-token.repository';
import { PushNotificationProvider, SendResult } from '../../application/ports/push-notification.provider';
import { PushNotification } from '../../domain/value-objects/push-notification.vo';
export declare class FcmPushNotificationProvider implements PushNotificationProvider {
    private readonly firebaseApp;
    private readonly deviceTokens;
    private readonly logger;
    constructor(firebaseApp: App, deviceTokens: DeviceTokenRepository);
    send(firebaseUid: string, notification: PushNotification): Promise<SendResult>;
    private sendWithRetry;
    private extractErrorCode;
}
