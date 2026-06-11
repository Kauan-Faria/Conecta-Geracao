"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = void 0;
class NotificationType {
    constructor(value) {
        this.value = value;
    }
    static reminder() {
        return new NotificationType('reminder');
    }
    static aiResponse() {
        return new NotificationType('ai_response');
    }
    static tip() {
        return new NotificationType('tip');
    }
    static campaign() {
        return new NotificationType('campaign');
    }
    static create(raw) {
        switch (raw) {
            case 'reminder':
                return NotificationType.reminder();
            case 'ai_response':
                return NotificationType.aiResponse();
            case 'tip':
                return NotificationType.tip();
            case 'campaign':
                return NotificationType.campaign();
            default:
                throw new Error(`Tipo de notificação inválido: ${raw}`);
        }
    }
}
exports.NotificationType = NotificationType;
//# sourceMappingURL=notification-type.vo.js.map