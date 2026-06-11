"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FcmToken = void 0;
const domain_errors_1 = require("../errors/domain.errors");
const MIN_LENGTH = 10;
class FcmToken {
    constructor(value) {
        this.value = value;
    }
    static create(raw) {
        const trimmed = raw.trim();
        if (trimmed.length < MIN_LENGTH) {
            throw new domain_errors_1.InvalidFcmTokenError(`Token FCM deve ter pelo menos ${MIN_LENGTH} caracteres.`);
        }
        return new FcmToken(trimmed);
    }
}
exports.FcmToken = FcmToken;
//# sourceMappingURL=fcm-token.vo.js.map