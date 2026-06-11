"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSentEvent = void 0;
class NotificationSentEvent {
    constructor(props) {
        this.notificationType = props.notificationType;
        this.occurredAt = props.occurredAt;
        this.campaignId = props.campaignId;
        this.tipId = props.tipId;
    }
    static create(props) {
        return new NotificationSentEvent(props);
    }
    toLogPayload() {
        const payload = {
            event: 'notification_sent',
            notificationType: this.notificationType,
            occurredAt: this.occurredAt.toISOString(),
        };
        if (this.campaignId)
            payload.campaignId = this.campaignId;
        if (this.tipId)
            payload.tipId = this.tipId;
        return payload;
    }
}
exports.NotificationSentEvent = NotificationSentEvent;
//# sourceMappingURL=notification-sent-event.vo.js.map