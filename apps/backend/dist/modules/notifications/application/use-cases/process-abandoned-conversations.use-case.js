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
var ProcessAbandonedConversationsUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessAbandonedConversationsUseCase = void 0;
const common_1 = require("@nestjs/common");
const notification_config_1 = require("../../domain/config/notification.config");
const abandoned_conversation_policy_1 = require("../../domain/services/abandoned-conversation.policy");
const notification_eligibility_policy_1 = require("../../domain/services/notification-eligibility.policy");
const reminder_cooldown_policy_1 = require("../../domain/services/reminder-cooldown.policy");
const abandoned_conversation_query_1 = require("../ports/abandoned-conversation.query");
const push_notification_templates_1 = require("../push-notification.templates");
const send_push_notification_use_case_1 = require("./send-push-notification.use-case");
let ProcessAbandonedConversationsUseCase = ProcessAbandonedConversationsUseCase_1 = class ProcessAbandonedConversationsUseCase {
    constructor(abandonedQuery, abandonedPolicy, eligibilityPolicy, cooldownPolicy, sendPush) {
        this.abandonedQuery = abandonedQuery;
        this.abandonedPolicy = abandonedPolicy;
        this.eligibilityPolicy = eligibilityPolicy;
        this.cooldownPolicy = cooldownPolicy;
        this.sendPush = sendPush;
        this.logger = new common_1.Logger(ProcessAbandonedConversationsUseCase_1.name);
    }
    async execute() {
        const thresholdHours = (0, notification_config_1.getInactivityThresholdHours)();
        const limit = (0, notification_config_1.getNotificationJobBatchLimit)();
        const snapshots = await this.abandonedQuery.findAbandoned(thresholdHours, limit);
        let sent = 0;
        let skipped = 0;
        for (const snapshot of snapshots) {
            if (!this.abandonedPolicy.isEligible(snapshot)) {
                skipped += 1;
                continue;
            }
            const eligibility = await this.eligibilityPolicy.canSend(snapshot.firebaseUid);
            if (!eligibility.eligible) {
                skipped += 1;
                continue;
            }
            if (!(await this.cooldownPolicy.canSendReminder(snapshot.conversationId))) {
                skipped += 1;
                continue;
            }
            const notification = (0, push_notification_templates_1.buildConversationReminder)(snapshot.conversationId);
            const result = await this.sendPush.execute(snapshot.firebaseUid, notification);
            if (result.status === 'sent' || result.status === 'partial') {
                sent += 1;
                this.logger.log({
                    event: 'ConversationReminderDispatched',
                    conversationId: snapshot.conversationId,
                    firebaseUid: snapshot.firebaseUid,
                    inactivityHours: thresholdHours,
                });
            }
            else {
                skipped += 1;
            }
        }
        return { processed: snapshots.length, sent, skipped };
    }
};
exports.ProcessAbandonedConversationsUseCase = ProcessAbandonedConversationsUseCase;
exports.ProcessAbandonedConversationsUseCase = ProcessAbandonedConversationsUseCase = ProcessAbandonedConversationsUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(abandoned_conversation_query_1.ABANDONED_CONVERSATION_QUERY)),
    __metadata("design:paramtypes", [Object, abandoned_conversation_policy_1.AbandonedConversationPolicy,
        notification_eligibility_policy_1.NotificationEligibilityPolicy,
        reminder_cooldown_policy_1.ReminderCooldownPolicy,
        send_push_notification_use_case_1.SendPushNotificationUseCase])
], ProcessAbandonedConversationsUseCase);
//# sourceMappingURL=process-abandoned-conversations.use-case.js.map