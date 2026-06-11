"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseUid = void 0;
const domain_errors_1 = require("../errors/domain.errors");
class FirebaseUid {
    constructor(value) {
        this.value = value;
    }
    static create(raw) {
        const trimmed = raw.trim();
        if (!trimmed) {
            throw new domain_errors_1.InvalidFirebaseUidError();
        }
        return new FirebaseUid(trimmed);
    }
}
exports.FirebaseUid = FirebaseUid;
//# sourceMappingURL=firebase-uid.vo.js.map