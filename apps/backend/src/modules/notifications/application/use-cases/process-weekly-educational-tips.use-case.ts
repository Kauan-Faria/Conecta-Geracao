import { Inject, Injectable, Logger } from '@nestjs/common';
import { getTipJobBatchLimit } from '../../domain/config/notification.config';
import { CuratedContentPolicy } from '../../domain/services/curated-content.policy';
import { TipSelectionPolicy } from '../../domain/services/tip-selection.policy';
import { TipWeeklyRateLimitPolicy } from '../../domain/services/tip-weekly-rate-limit.policy';
import {
  EDUCATIONAL_TIP_CATALOG_REPOSITORY,
  EducationalTipCatalogRepository,
} from '../ports/educational-tip-catalog.repository';
import { ACTIVE_USER_QUERY, ActiveUserQuery } from '../ports/active-user.query';
import { buildEducationalTip } from '../push-notification.templates';
import { SendPushNotificationUseCase } from './send-push-notification.use-case';

export interface ProcessWeeklyEducationalTipsResult {
  processed: number;
  sent: number;
  skipped: number;
}

@Injectable()
export class ProcessWeeklyEducationalTipsUseCase {
  private readonly logger = new Logger(ProcessWeeklyEducationalTipsUseCase.name);

  constructor(
    @Inject(EDUCATIONAL_TIP_CATALOG_REPOSITORY)
    private readonly catalog: EducationalTipCatalogRepository,
    @Inject(ACTIVE_USER_QUERY)
    private readonly activeUsers: ActiveUserQuery,
    private readonly tipRateLimit: TipWeeklyRateLimitPolicy,
    private readonly tipSelection: TipSelectionPolicy,
    private readonly curatedContent: CuratedContentPolicy,
    private readonly sendPush: SendPushNotificationUseCase,
  ) {}

  async execute(): Promise<ProcessWeeklyEducationalTipsResult> {
    const tips = await this.catalog.findAllActive();
    if (tips.length === 0) {
      this.logger.warn({ event: 'EducationalTipsCatalogEmpty' });
      return { processed: 0, sent: 0, skipped: 0 };
    }

    const limit = getTipJobBatchLimit();
    const users = (await this.activeUsers.findAllWithActiveTokensAndPreference()).slice(
      0,
      limit,
    );

    let sent = 0;
    let skipped = 0;

    for (const firebaseUid of users) {
      if (!(await this.tipRateLimit.canSendTip(firebaseUid))) {
        skipped += 1;
        continue;
      }

      const tip = this.tipSelection.selectTipForUser(firebaseUid, tips);
      await this.curatedContent.assertFromCatalog(tip.id!);

      const notification = buildEducationalTip({
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
      } else {
        skipped += 1;
      }
    }

    return { processed: users.length, sent, skipped };
  }
}
