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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaActiveUserQuery = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../shared/prisma/prisma.service");
let PrismaActiveUserQuery = class PrismaActiveUserQuery {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllWithActiveTokensAndPreference() {
        const tokens = await this.prisma.deviceToken.findMany({
            where: { isActive: true },
            select: { firebaseUid: true },
            distinct: ['firebaseUid'],
        });
        if (tokens.length === 0) {
            return [];
        }
        const uids = tokens.map((t) => t.firebaseUid);
        const disabled = await this.prisma.notificationPreference.findMany({
            where: { firebaseUid: { in: uids }, enabled: false },
            select: { firebaseUid: true },
        });
        const disabledSet = new Set(disabled.map((p) => p.firebaseUid));
        return uids.filter((uid) => !disabledSet.has(uid));
    }
};
exports.PrismaActiveUserQuery = PrismaActiveUserQuery;
exports.PrismaActiveUserQuery = PrismaActiveUserQuery = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaActiveUserQuery);
//# sourceMappingURL=prisma-active-user.query.js.map