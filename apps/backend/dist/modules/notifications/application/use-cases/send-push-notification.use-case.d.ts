import { NotificationEligibilityPolicy } from '../../domain/services/notification-eligibility.policy';
import { PushNotificationPayloadPolicy } from '../../domain/services/push-notification-payload.policy';
import { ReminderCooldownPolicy } from '../../domain/services/reminder-cooldown.policy';
import { PushNotification } from '../../domain/value-objects/push-notification.vo';
import { NotificationAnalyticsPort } from '../ports/notification-analytics.port';
import { NotificationDeliveryLogRepository } from '../ports/notification-delivery-log.repository';
import { PushNotificationProvider, SendResult } from '../ports/push-notification.provider';
export interface SendPushOptions {
    campaignId?: string;
    tipId?: string;
}
export declare class SendPushNotificationUseCase {
    private readonly payloadPolicy;
    private readonly eligibilityPolicy;
    private readonly cooldownPolicy;
    private readonly pushProvider;
    private readonly deliveryLogs;
    private readonly analytics;
    private readonly logger;
    constructor(payloadPolicy: PushNotificationPayloadPolicy, eligibilityPolicy: NotificationEligibilityPolicy, cooldownPolicy: ReminderCooldownPolicy, pushProvider: PushNotificationProvider, deliveryLogs: NotificationDeliveryLogRepository, analytics: NotificationAnalyticsPort);
    execute(firebaseUid: string, notification: PushNotification, options?: SendPushOptions): Promise<SendResult>;
    private trackAnalytics;
    private recordSkip;
    private recordResult;
    private shouldPersistDeliveryLog;
}
