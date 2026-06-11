import { ProcessWeeklyEducationalTipsUseCase } from '../../application/use-cases/process-weekly-educational-tips.use-case';
export declare class WeeklyEducationalTipsJob {
    private readonly processWeeklyTips;
    private readonly logger;
    constructor(processWeeklyTips: ProcessWeeklyEducationalTipsUseCase);
    handleCron(): Promise<void>;
}
