"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SendPushNotificationUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendPushNotificationUseCase = void 0;
const common_1 = require("@nestjs/common");
const notification_delivery_log_entity_1 = require("../../domain/entities/notification-delivery-log.entity");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const notification_eligibility_policy_1 = require("../../domain/services/notification-eligibility.policy");
const push_notification_payload_policy_1 = require("../../domain/services/push-notification-payload.policy");
const reminder_cooldown_policy_1 = require("../../domain/services/reminder-cooldown.policy");
const notification_sent_event_vo_1 = require("../../domain/value-objects/notification-sent-event.vo");
const notification_analytics_port_1 = require("../ports/notification-analytics.port");
const notification_delivery_log_repository_1 = require("../ports/notification-delivery-log.repository");
const push_notification_provider_1 = require("../ports/push-notification.provider");
let SendPushNotificationUseCase = SendPushNotificationUseCase_1 = class SendPushNotificationUseCase {
    constructor(payloadPolicy, eligibilityPolicy, cooldownPolicy, pushProvider, deliveryLogs, analytics) {
        this.payloadPolicy = payloadPolicy;
        this.eligibilityPolicy = eligibilityPolicy;
        this.cooldownPolicy = cooldownPolicy;
        this.pushProvider = pushProvider;
        this.deliveryLogs = deliveryLogs;
        this.analytics = analytics;
        this.logger = new common_1.Logger(SendPushNotificationUseCase_1.name);
    }
    async execute(firebaseUid, notification, options) {
        try {
            this.payloadPolicy.assertSafePayload(notification);
        }
        catch (error) {
            if (error instanceof domain_errors_1.DomainError) {
                return this.recordSkip(firebaseUid, notification, 'unsafe_payload');
            }
            throw error;
        }
        const eligibility = await this.eligibilityPolicy.canSend(firebaseUid);
        if (!eligibility.eligible) {
            return this.recordSkip(firebaseUid, notification, eligibility.reason);
        }
        if (notification.type.value === 'reminder' &&
            notification.conversationId &&
            !(await this.cooldownPolicy.canSendReminder(notification.conversationId))) {
            return this.recordSkip(firebaseUid, notification, 'cooldown_active');
        }
        const result = await this.pushProvider.send(firebaseUid, notification);
        await this.recordResult(firebaseUid, notification, result);
        if (result.status === 'sent' || result.status === 'partial') {
            this.logger.log({
                event: 'PushNotificationSent',
                firebaseUid,
                notificationType: notification.type.value,
                conversationId: notification.conversationId,
                messageIds: result.messageIds,
            });
            await this.trackAnalytics(notification, options);
        }
        else if (result.status === 'skipped') {
            this.logger.log({
                event: 'PushNotificationSkipped',
                firebaseUid,
                notificationType: notification.type.value,
                conversationId: notification.conversationId,
                reason: result.skippedReason,
            });
        }
        return result;
    }
    async trackAnalytics(notification, options) {
        try {
            await this.analytics.trackNotificationSent(notification_sent_event_vo_1.NotificationSentEvent.create({
                notificationType: notification.type.value,
                occurredAt: new Date(),
                campaignId: options?.campaignId,
                tipId: options?.tipId,
            }));
        }
        catch (error) {
            this.logger.error({
                event: 'NotificationAnalyticsFailed',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async recordSkip(firebaseUid, notification, reason) {
        const result = push_notification_provider_1.SendResults.skipped(reason);
        await this.recordResult(firebaseUid, notification, result);
        this.logger.log({
            event: 'PushNotificationSkipped',
            firebaseUid,
            notificationType: notification.type.value,
            conversationId: notification.conversationId,
            reason,
        });
        return result;
    }
    async recordResult(firebaseUid, notification, result) {
        if (!this.shouldPersistDeliveryLog(notification)) {
            return;
        }
        if (result.status === 'skipped') {
            await this.deliveryLogs.save(notification_delivery_log_entity_1.NotificationDeliveryLog.createSkipped({
                firebaseUid,
                conversationId: notification.conversationId,
                notificationType: notification.type.value,
                skippedReason: result.skippedReason ?? 'unknown',
            }));
            return;
        }
        if (result.status === 'sent' || result.status === 'partial') {
            await this.deliveryLogs.save(notification_delivery_log_entity_1.NotificationDeliveryLog.createSent({
                firebaseUid,
                conversationId: notification.conversationId,
                notificationType: notification.type.value,
                fcmMessageId: result.messageIds?.[0] ?? null,
            }));
        }
    }
    shouldPersistDeliveryLog(notification) {
        if (notification.conversationId) {
            return true;
        }
        return notification.type.value === 'tip' || notification.type.value === 'campaign';
    }
};
exports.SendPushNotificationUseCase = SendPushNotificationUseCase;
exports.SendPushNotificationUseCase = SendPushNotificationUseCase = SendPushNotificationUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)(push_notification_provider_1.PUSH_NOTIFICATION_PROVIDER)),
    __param(4, (0, common_1.Inject)(notification_delivery_log_repository_1.NOTIFICATION_DELIVERY_LOG_REPOSITORY)),
    __param(5, (0, common_1.Inject)(notification_analytics_port_1.NOTIFICATION_ANALYTICS_PORT)),
    __metadata("design:paramtypes", [push_notification_payload_policy_1.PushNotificationPayloadPolicy,
        notification_eligibility_policy_1.NotificationEligibilityPolicy,
        reminder_cooldown_policy_1.ReminderCooldownPolicy, Object, Object, Object])
], SendPushNotificationUseCase);
//# sourceMappingURL=send-push-notification.use-case.js.map