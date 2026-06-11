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
var NotifyAiResponseReadyUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifyAiResponseReadyUseCase = void 0;
const common_1 = require("@nestjs/common");
const ai_response_notification_policy_1 = require("../../domain/services/ai-response-notification.policy");
const push_notification_templates_1 = require("../push-notification.templates");
const push_notification_provider_1 = require("../ports/push-notification.provider");
const send_push_notification_use_case_1 = require("./send-push-notification.use-case");
let NotifyAiResponseReadyUseCase = NotifyAiResponseReadyUseCase_1 = class NotifyAiResponseReadyUseCase {
    constructor(aiResponsePolicy, sendPush) {
        this.aiResponsePolicy = aiResponsePolicy;
        this.sendPush = sendPush;
        this.logger = new common_1.Logger(NotifyAiResponseReadyUseCase_1.name);
    }
    async execute(event) {
        if (!this.aiResponsePolicy.shouldNotify(event)) {
            this.logger.debug({
                event: 'PushNotificationSkipped',
                reason: 'app_in_foreground',
                conversationId: event.conversationId,
                firebaseUid: event.firebaseUid,
            });
            return push_notification_provider_1.SendResults.skipped('app_in_foreground');
        }
        const notification = (0, push_notification_templates_1.buildAiResponseReady)(event.conversationId);
        const result = await this.sendPush.execute(event.firebaseUid, notification);
        if (result.status === 'sent' || result.status === 'partial') {
            this.logger.log({
                event: 'AiResponseNotificationDispatched',
                conversationId: event.conversationId,
                firebaseUid: event.firebaseUid,
            });
        }
        return result;
    }
};
exports.NotifyAiResponseReadyUseCase = NotifyAiResponseReadyUseCase;
exports.NotifyAiResponseReadyUseCase = NotifyAiResponseReadyUseCase = NotifyAiResponseReadyUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_response_notification_policy_1.AiResponseNotificationPolicy,
        send_push_notification_use_case_1.SendPushNotificationUseCase])
], NotifyAiResponseReadyUseCase);
//# sourceMappingURL=notify-ai-response-ready.use-case.js.map