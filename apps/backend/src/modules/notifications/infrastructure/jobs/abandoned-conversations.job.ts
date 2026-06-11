import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProcessAbandonedConversationsUseCase } from '../../application/use-cases/process-abandoned-conversations.use-case';

@Injectable()
export class AbandonedConversationsJob {
  private readonly logger = new Logger(AbandonedConversationsJob.name);

  constructor(
    private readonly processAbandonedConversations: ProcessAbandonedConversationsUseCase,
  ) {}

  @Cron(process.env.ABANDONED_CONVERSATIONS_CRON ?? '0 */6 * * *')
  async handleCron(): Promise<void> {
    try {
      const summary = await this.processAbandonedConversations.execute();
      this.logger.log({
        event: 'AbandonedConversationsJobCompleted',
        ...summary,
      });
    } catch (error) {
      this.logger.error({
        event: 'AbandonedConversationsJobFailed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
