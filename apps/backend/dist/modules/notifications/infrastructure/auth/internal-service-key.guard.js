"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServiceKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const notification_config_1 = require("../../domain/config/notification.config");
let InternalServiceKeyGuard = class InternalServiceKeyGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const provided = request.headers['x-internal-service-key'];
        const expected = (0, notification_config_1.getInternalServiceKey)();
        if (!expected || !provided || provided !== expected) {
            throw new common_1.UnauthorizedException({
                error: { code: 'UNAUTHORIZED', message: 'Credencial interna inválida ou ausente.' },
            });
        }
        return true;
    }
};
exports.InternalServiceKeyGuard = InternalServiceKeyGuard;
exports.InternalServiceKeyGuard = InternalServiceKeyGuard = __decorate([
    (0, common_1.Injectable)()
], InternalServiceKeyGuard);
//# sourceMappingURL=internal-service-key.guard.js.map