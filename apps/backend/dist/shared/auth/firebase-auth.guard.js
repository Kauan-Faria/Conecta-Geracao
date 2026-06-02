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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_1 = require("firebase-admin/auth");
const firebase_admin_provider_1 = require("./firebase-admin.provider");
let FirebaseAuthGuard = class FirebaseAuthGuard {
    constructor(firebaseApp) {
        this.firebaseApp = firebaseApp;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException({
                error: { code: 'UNAUTHORIZED', message: 'Token de autenticação ausente.' },
            });
        }
        const token = authHeader.slice('Bearer '.length).trim();
        if (!token) {
            throw new common_1.UnauthorizedException({
                error: { code: 'UNAUTHORIZED', message: 'Token de autenticação inválido.' },
            });
        }
        try {
            const decoded = await (0, auth_1.getAuth)(this.firebaseApp).verifyIdToken(token);
            request.user = { uid: decoded.uid };
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException({
                error: { code: 'UNAUTHORIZED', message: 'Token de autenticação inválido ou expirado.' },
            });
        }
    }
};
exports.FirebaseAuthGuard = FirebaseAuthGuard;
exports.FirebaseAuthGuard = FirebaseAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(firebase_admin_provider_1.FIREBASE_ADMIN)),
    __metadata("design:paramtypes", [Object])
], FirebaseAuthGuard);
//# sourceMappingURL=firebase-auth.guard.js.map