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
exports.ReplyGuestMessageUseCase = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const assistant_reply_generator_1 = require("../ports/assistant-reply.generator");
const message_metadata_vo_1 = require("../../domain/value-objects/message-metadata.vo");
let ReplyGuestMessageUseCase = class ReplyGuestMessageUseCase {
    constructor(replyGenerator) {
        this.replyGenerator = replyGenerator;
    }
    async execute(input) {
        const assistantReply = await this.replyGenerator.generateReply({
            conversationId: 'guest-ephemeral',
            userMessage: input.content,
            topicSlug: input.topicSlug,
            currentStep: input.currentStep,
            messageHistory: input.messageHistory,
        });
        const metadata = assistantReply.mapAction
            ? message_metadata_vo_1.MessageMetadata.fromMapAction(assistantReply.mapAction)
            : null;
        return {
            id: (0, crypto_1.randomUUID)(),
            role: 'assistant',
            content: assistantReply.content.value,
            currentStep: assistantReply.nextCurrentStep,
            topicSlug: assistantReply.resolvedTopicSlug ?? input.topicSlug ?? null,
            metadata,
            createdAt: new Date().toISOString(),
        };
    }
};
exports.ReplyGuestMessageUseCase = ReplyGuestMessageUseCase;
exports.ReplyGuestMessageUseCase = ReplyGuestMessageUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(assistant_reply_generator_1.ASSISTANT_REPLY_GENERATOR)),
    __metadata("design:paramtypes", [Object])
], ReplyGuestMessageUseCase);
//# sourceMappingURL=reply-guest-message.use-case.js.map