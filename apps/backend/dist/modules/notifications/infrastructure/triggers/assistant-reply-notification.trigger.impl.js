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
var AssistantReplyNotificationTriggerImpl_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantReplyNotificationTriggerImpl = void 0;
const common_1 = require("@nestjs/common");
const notify_ai_response_ready_use_case_1 = require("../../application/use-cases/notify-ai-response-ready.use-case");
let AssistantReplyNotificationTriggerImpl = AssistantReplyNotificationTriggerImpl_1 = class AssistantReplyNotificationTriggerImpl {
    constructor(notifyAiResponseReady) {
        this.notifyAiResponseReady = notifyAiResponseReady;
        this.logger = new common_1.Logger(AssistantReplyNotificationTriggerImpl_1.name);
    }
    async onAssistantReplyReady(event) {
        try {
            await this.notifyAiResponseReady.execute(event);
        }
        catch (error) {
            this.logger.error({
                event: 'AssistantReplyNotificationFailed',
                conversationId: event.conversationId,
                firebaseUid: event.firebaseUid,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
};
exports.AssistantReplyNotificationTriggerImpl = AssistantReplyNotificationTriggerImpl;
exports.AssistantReplyNotificationTriggerImpl = AssistantReplyNotificationTriggerImpl = AssistantReplyNotificationTriggerImpl_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notify_ai_response_ready_use_case_1.NotifyAiResponseReadyUseCase])
], AssistantReplyNotificationTriggerImpl);
//# sourceMappingURL=assistant-reply-notification.trigger.impl.js.map