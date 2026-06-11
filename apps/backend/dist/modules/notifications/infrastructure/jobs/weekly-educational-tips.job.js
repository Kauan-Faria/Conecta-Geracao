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
var WeeklyEducationalTipsJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeeklyEducationalTipsJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const process_weekly_educational_tips_use_case_1 = require("../../application/use-cases/process-weekly-educational-tips.use-case");
let WeeklyEducationalTipsJob = WeeklyEducationalTipsJob_1 = class WeeklyEducationalTipsJob {
    constructor(processWeeklyTips) {
        this.processWeeklyTips = processWeeklyTips;
        this.logger = new common_1.Logger(WeeklyEducationalTipsJob_1.name);
    }
    async handleCron() {
        try {
            const summary = await this.processWeeklyTips.execute();
            this.logger.log({
                event: 'WeeklyEducationalTipsJobCompleted',
                ...summary,
            });
        }
        catch (error) {
            this.logger.error({
                event: 'WeeklyEducationalTipsJobFailed',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
};
exports.WeeklyEducationalTipsJob = WeeklyEducationalTipsJob;
__decorate([
    (0, schedule_1.Cron)(process.env.EDUCATIONAL_TIPS_CRON ?? '0 10 * * 1'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WeeklyEducationalTipsJob.prototype, "handleCron", null);
exports.WeeklyEducationalTipsJob = WeeklyEducationalTipsJob = WeeklyEducationalTipsJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [process_weekly_educational_tips_use_case_1.ProcessWeeklyEducationalTipsUseCase])
], WeeklyEducationalTipsJob);
//# sourceMappingURL=weekly-educational-tips.job.js.map