"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDeliveryLog = void 0;
class NotificationDeliveryLog {
    constructor(props) {
        this.id = props.id;
        this.firebaseUid = props.firebaseUid;
        this.conversationId = props.conversationId;
        this.notificationType = props.notificationType;
        this.status = props.status;
        this.fcmMessageId = props.fcmMessageId;
        this.skippedReason = props.skippedReason;
        this.sentAt = props.sentAt;
    }
    static createSent(props) {
        return new NotificationDeliveryLog({
            firebaseUid: props.firebaseUid,
            conversationId: props.conversationId ?? null,
            notificationType: props.notificationType,
            status: 'sent',
            fcmMessageId: props.fcmMessageId ?? null,
            skippedReason: null,
            sentAt: new Date(),
        });
    }
    static createSkipped(props) {
        return new NotificationDeliveryLog({
            firebaseUid: props.firebaseUid,
            conversationId: props.conversationId ?? null,
            notificationType: props.notificationType,
            status: 'skipped',
            fcmMessageId: null,
            skippedReason: props.skippedReason,
            sentAt: new Date(),
        });
    }
    static reconstitute(props) {
        return new NotificationDeliveryLog({
            id: props.id,
            firebaseUid: props.firebaseUid,
            conversationId: props.conversationId ?? null,
            notificationType: props.notificationType,
            status: props.status,
            fcmMessageId: props.fcmMessageId ?? null,
            skippedReason: props.skippedReason ?? null,
            sentAt: props.sentAt ?? new Date(),
        });
    }
}
exports.NotificationDeliveryLog = NotificationDeliveryLog;
//# sourceMappingURL=notification-delivery-log.entity.js.map