import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProcessWeeklyEducationalTipsUseCase } from '../../application/use-cases/process-weekly-educational-tips.use-case';

@Injectable()
export class WeeklyEducationalTipsJob {
  private readonly logger = new Logger(WeeklyEducationalTipsJob.name);

  constructor(
    private readonly processWeeklyTips: ProcessWeeklyEducationalTipsUseCase,
  ) {}

  @Cron(process.env.EDUCATIONAL_TIPS_CRON ?? '0 10 * * 1')
  async handleCron(): Promise<void> {
    try {
      const summary = await this.processWeeklyTips.execute();
      this.logger.log({
        event: 'WeeklyEducationalTipsJobCompleted',
        ...summary,
      });
    } catch (error) {
      this.logger.error({
        event: 'WeeklyEducationalTipsJobFailed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
