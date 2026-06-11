"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUSH_NOTIFICATION_PROVIDER = exports.SendResults = void 0;
exports.SendResults = {
    sent(messageIds) {
        return { status: 'sent', messageIds };
    },
    skipped(reason) {
        return { status: 'skipped', skippedReason: reason };
    },
    partial(messageIds, error) {
        return { status: 'partial', messageIds, error };
    },
    failed(error) {
        return { status: 'failed', error };
    },
};
exports.PUSH_NOTIFICATION_PROVIDER = Symbol('PUSH_NOTIFICATION_PROVIDER');
//# sourceMappingURL=push-notification.provider.js.map