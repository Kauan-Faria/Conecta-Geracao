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
var ProcessWeeklyEducationalTipsUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessWeeklyEducationalTipsUseCase = void 0;
const common_1 = require("@nestjs/common");
const notification_config_1 = require("../../domain/config/notification.config");
const curated_content_policy_1 = require("../../domain/services/curated-content.policy");
const tip_selection_policy_1 = require("../../domain/services/tip-selection.policy");
const tip_weekly_rate_limit_policy_1 = require("../../domain/services/tip-weekly-rate-limit.policy");
const educational_tip_catalog_repository_1 = require("../ports/educational-tip-catalog.repository");
const active_user_query_1 = require("../ports/active-user.query");
const push_notification_templates_1 = require("../push-notification.templates");
const send_push_notification_use_case_1 = require("./send-push-notification.use-case");
let ProcessWeeklyEducationalTipsUseCase = ProcessWeeklyEducationalTipsUseCase_1 = class ProcessWeeklyEducationalTipsUseCase {
    constructor(catalog, activeUsers, tipRateLimit, tipSelection, curatedContent, sendPush) {
        this.catalog = catalog;
        this.activeUsers = activeUsers;
        this.tipRateLimit = tipRateLimit;
        this.tipSelection = tipSelection;
        this.curatedContent = curatedContent;
        this.sendPush = sendPush;
        this.logger = new common_1.Logger(ProcessWeeklyEducationalTipsUseCase_1.name);
    }
    async execute() {
        const tips = await this.catalog.findAllActive();
        if (tips.length === 0) {
            this.logger.warn({ event: 'EducationalTipsCatalogEmpty' });
            return { processed: 0, sent: 0, skipped: 0 };
        }
        const limit = (0, notification_config_1.getTipJobBatchLimit)();
        const users = (await this.activeUsers.findAllWithActiveTokensAndPreference()).slice(0, limit);
        let sent = 0;
        let skipped = 0;
        for (const firebaseUid of users) {
            if (!(await this.tipRateLimit.canSendTip(firebaseUid))) {
                skipped += 1;
                continue;
            }
            const tip = this.tipSelection.selectTipForUser(firebaseUid, tips);
            await this.curatedContent.assertFromCatalog(tip.id);
            const notification = (0, push_notification_templates_1.buildEducationalTip)({
                title: tip.title,
                body: tip.body,
                deepLink: tip.deepLink,
            });
            const result = await this.sendPush.execute(firebaseUid, notification, {
                tipId: tip.id,
            });
            if (result.status === 'sent' || result.status === 'partial') {
                sent += 1;
                this.logger.log({
                    event: 'EducationalTipDispatched',
                    tipId: tip.id,
                    firebaseUid,
                });
            }
            else {
                skipped += 1;
            }
        }
        return { processed: users.length, sent, skipped };
    }
};
exports.ProcessWeeklyEducationalTipsUseCase = ProcessWeeklyEducationalTipsUseCase;
exports.ProcessWeeklyEducationalTipsUseCase = ProcessWeeklyEducationalTipsUseCase = ProcessWeeklyEducationalTipsUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(educational_tip_catalog_repository_1.EDUCATIONAL_TIP_CATALOG_REPOSITORY)),
    __param(1, (0, common_1.Inject)(active_user_query_1.ACTIVE_USER_QUERY)),
    __metadata("design:paramtypes", [Object, Object, tip_weekly_rate_limit_policy_1.TipWeeklyRateLimitPolicy,
        tip_selection_policy_1.TipSelectionPolicy,
        curated_content_policy_1.CuratedContentPolicy,
        send_push_notification_use_case_1.SendPushNotificationUseCase])
], ProcessWeeklyEducationalTipsUseCase);
//# sourceMappingURL=process-weekly-educational-tips.use-case.js.map