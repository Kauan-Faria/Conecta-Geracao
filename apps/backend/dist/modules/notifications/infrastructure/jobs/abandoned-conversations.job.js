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
var AbandonedConversationsJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbandonedConversationsJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const process_abandoned_conversations_use_case_1 = require("../../application/use-cases/process-abandoned-conversations.use-case");
let AbandonedConversationsJob = AbandonedConversationsJob_1 = class AbandonedConversationsJob {
    constructor(processAbandonedConversations) {
        this.processAbandonedConversations = processAbandonedConversations;
        this.logger = new common_1.Logger(AbandonedConversationsJob_1.name);
    }
    async handleCron() {
        try {
            const summary = await this.processAbandonedConversations.execute();
            this.logger.log({
                event: 'AbandonedConversationsJobCompleted',
                ...summary,
            });
        }
        catch (error) {
            this.logger.error({
                event: 'AbandonedConversationsJobFailed',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
};
exports.AbandonedConversationsJob = AbandonedConversationsJob;
__decorate([
    (0, schedule_1.Cron)(process.env.ABANDONED_CONVERSATIONS_CRON ?? '0 */6 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbandonedConversationsJob.prototype, "handleCron", null);
exports.AbandonedConversationsJob = AbandonedConversationsJob = AbandonedConversationsJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [process_abandoned_conversations_use_case_1.ProcessAbandonedConversationsUseCase])
], AbandonedConversationsJob);
//# sourceMappingURL=abandoned-conversations.job.js.map