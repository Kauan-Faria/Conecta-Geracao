"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DeactivateDeviceTokenUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeactivateDeviceTokenUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../shared/result");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const fcm_token_vo_1 = require("../../domain/value-objects/fcm-token.vo");
const firebase_uid_vo_1 = require("../../domain/value-objects/firebase-uid.vo");
const device_token_repository_1 = require("../ports/device-token.repository");
let DeactivateDeviceTokenUseCase = DeactivateDeviceTokenUseCase_1 = class DeactivateDeviceTokenUseCase {
    constructor(deviceTokens) {
        this.deviceTokens = deviceTokens;
        this.logger = new common_1.Logger(DeactivateDeviceTokenUseCase_1.name);
    }
    async execute(firebaseUid, token) {
        try {
            firebase_uid_vo_1.FirebaseUid.create(firebaseUid);
            fcm_token_vo_1.FcmToken.create(token);
            await this.deviceTokens.deactivateByFirebaseUidAndToken(firebaseUid, token);
            this.logger.log({
                event: 'DeviceTokenDeactivated',
                firebaseUid,
                tokenPrefix: `${token.slice(0, 8)}...`,
            });
            return (0, result_1.ok)(undefined);
        }
        catch (error) {
            if (error instanceof domain_errors_1.DomainError) {
                return (0, result_1.err)(error);
            }
            throw error;
        }
    }
};
exports.DeactivateDeviceTokenUseCase = DeactivateDeviceTokenUseCase;
exports.DeactivateDeviceTokenUseCase = DeactivateDeviceTokenUseCase = DeactivateDeviceTokenUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(device_token_repository_1.DEVICE_TOKEN_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], DeactivateDeviceTokenUseCase);
//# sourceMappingURL=deactivate-device-token.use-case.js.map