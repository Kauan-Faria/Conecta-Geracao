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
exports.GuestChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const reply_guest_message_use_case_1 = require("../application/use-cases/reply-guest-message.use-case");
const reply_guest_message_dto_1 = require("./dto/reply-guest-message.dto");
let GuestChatController = class GuestChatController {
    constructor(replyGuestMessage) {
        this.replyGuestMessage = replyGuestMessage;
    }
    async reply(dto) {
        return this.replyGuestMessage.execute({
            content: dto.content,
            topicSlug: dto.topicSlug ?? null,
            currentStep: dto.currentStep ?? 0,
            messageHistory: dto.messageHistory ?? [],
        });
    }
};
exports.GuestChatController = GuestChatController;
__decorate([
    (0, common_1.Post)('messages'),
    (0, common_1.HttpCode)(200),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Enviar mensagem como convidado e receber resposta do assistente (sem persistência)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reply_guest_message_dto_1.ReplyGuestMessageDto]),
    __metadata("design:returntype", Promise)
], GuestChatController.prototype, "reply", null);
exports.GuestChatController = GuestChatController = __decorate([
    (0, swagger_1.ApiTags)('guest-chat'),
    (0, common_1.Controller)('guest/chat'),
    __metadata("design:paramtypes", [reply_guest_message_use_case_1.ReplyGuestMessageUseCase])
], GuestChatController);
//# sourceMappingURL=guest-chat.controller.js.map