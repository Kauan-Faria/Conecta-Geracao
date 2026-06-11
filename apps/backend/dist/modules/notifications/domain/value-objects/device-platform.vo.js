"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicePlatform = void 0;
const domain_errors_1 = require("../errors/domain.errors");
class DevicePlatform {
    constructor(value) {
        this.value = value;
    }
    static create(raw) {
        if (raw === 'ios' || raw === 'android') {
            return new DevicePlatform(raw);
        }
        throw new domain_errors_1.InvalidDevicePlatformError(raw);
    }
}
exports.DevicePlatform = DevicePlatform;
//# sourceMappingURL=device-platform.vo.js.map