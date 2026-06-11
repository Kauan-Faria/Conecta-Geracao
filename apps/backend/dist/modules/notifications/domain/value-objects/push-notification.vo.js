"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotification = void 0;
const domain_errors_1 = require("../errors/domain.errors");
const notification_type_vo_1 = require("./notification-type.vo");
const SENSITIVE_PATTERNS = [
    /\bpassword\b/i,
    /\botp\b/i,
    /\bcpf\b/i,
    /\bsenha\b/i,
];
class PushNotification {
    constructor(props) {
        this.type = props.type;
        this.title = props.title;
        this.body = props.body;
        this.deepLink = props.deepLink;
        this.conversationId = props.conversationId;
    }
    static create(props) {
        const title = props.title.trim();
        const body = props.body.trim();
        const deepLink = props.deepLink.trim();
        if (!title || !body || !deepLink) {
            throw new domain_errors_1.InvalidPushNotificationError('Título, corpo e deep link são obrigatórios.');
        }
        const combined = `${title} ${body} ${deepLink}`;
        for (const pattern of SENSITIVE_PATTERNS) {
            if (pattern.test(combined)) {
                throw new domain_errors_1.InvalidPushNotificationError('Payload de notificação contém conteúdo sensível.');
            }
        }
        return new PushNotification({
            type: notification_type_vo_1.NotificationType.create(props.type),
            title,
            body,
            deepLink,
            conversationId: props.conversationId?.trim() ?? null,
        });
    }
}
exports.PushNotification = PushNotification;
//# sourceMappingURL=push-notification.vo.js.map