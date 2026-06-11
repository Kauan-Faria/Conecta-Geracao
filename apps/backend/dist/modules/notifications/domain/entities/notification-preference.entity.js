"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPreference = void 0;
const firebase_uid_vo_1 = require("../value-objects/firebase-uid.vo");
class NotificationPreference {
    constructor(props) {
        this.firebaseUid = props.firebaseUid;
        this.enabled = props.enabled;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    static createDefault(firebaseUid) {
        const uid = firebase_uid_vo_1.FirebaseUid.create(firebaseUid);
        const now = new Date();
        return new NotificationPreference({
            firebaseUid: uid.value,
            enabled: true,
            createdAt: now,
            updatedAt: now,
        });
    }
    static reconstitute(props) {
        return new NotificationPreference({
            firebaseUid: props.firebaseUid,
            enabled: props.enabled ?? true,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }
    updateEnabled(enabled) {
        return new NotificationPreference({
            firebaseUid: this.firebaseUid,
            enabled,
            createdAt: this.createdAt,
            updatedAt: new Date(),
        });
    }
}
exports.NotificationPreference = NotificationPreference;
//# sourceMappingURL=notification-preference.entity.js.map