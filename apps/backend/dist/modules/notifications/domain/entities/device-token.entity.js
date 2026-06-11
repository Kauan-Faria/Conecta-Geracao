"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceToken = void 0;
const device_platform_vo_1 = require("../value-objects/device-platform.vo");
const fcm_token_vo_1 = require("../value-objects/fcm-token.vo");
const firebase_uid_vo_1 = require("../value-objects/firebase-uid.vo");
class DeviceToken {
    constructor(props) {
        this.id = props.id;
        this.firebaseUid = props.firebaseUid;
        this.token = props.token;
        this.platform = props.platform;
        this.isActive = props.isActive;
        this.lastSeenAt = props.lastSeenAt;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    static register(props) {
        const uid = firebase_uid_vo_1.FirebaseUid.create(props.firebaseUid);
        const token = fcm_token_vo_1.FcmToken.create(props.token);
        const platform = device_platform_vo_1.DevicePlatform.create(props.platform);
        const now = new Date();
        return new DeviceToken({
            firebaseUid: uid.value,
            token,
            platform,
            isActive: true,
            lastSeenAt: now,
            createdAt: now,
            updatedAt: now,
        });
    }
    static reconstitute(props) {
        return new DeviceToken({
            id: props.id,
            firebaseUid: props.firebaseUid,
            token: props.token,
            platform: props.platform,
            isActive: props.isActive ?? true,
            lastSeenAt: props.lastSeenAt ?? new Date(),
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }
    refreshLastSeen() {
        const now = new Date();
        return new DeviceToken({
            id: this.id,
            firebaseUid: this.firebaseUid,
            token: this.token,
            platform: this.platform,
            isActive: true,
            lastSeenAt: now,
            createdAt: this.createdAt,
            updatedAt: now,
        });
    }
    deactivate() {
        return new DeviceToken({
            id: this.id,
            firebaseUid: this.firebaseUid,
            token: this.token,
            platform: this.platform,
            isActive: false,
            lastSeenAt: this.lastSeenAt,
            createdAt: this.createdAt,
            updatedAt: new Date(),
        });
    }
}
exports.DeviceToken = DeviceToken;
//# sourceMappingURL=device-token.entity.js.map