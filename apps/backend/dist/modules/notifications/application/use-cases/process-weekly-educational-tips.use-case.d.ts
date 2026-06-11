import { CuratedContentPolicy } from '../../domain/services/curated-content.policy';
import { TipSelectionPolicy } from '../../domain/services/tip-selection.policy';
import { TipWeeklyRateLimitPolicy } from '../../domain/services/tip-weekly-rate-limit.policy';
import { EducationalTipCatalogRepository } from '../ports/educational-tip-catalog.repository';
import { ActiveUserQuery } from '../ports/active-user.query';
import { SendPushNotificationUseCase } from './send-push-notification.use-case';
export interface ProcessWeeklyEducationalTipsResult {
    processed: number;
    sent: number;
    skipped: number;
}
export declare class ProcessWeeklyEducationalTipsUseCase {
    private readonly catalog;
    private readonly activeUsers;
    private readonly tipRateLimit;
    private readonly tipSelection;
    private readonly curatedContent;
    private readonly sendPush;
    private readonly logger;
    constructor(catalog: EducationalTipCatalogRepository, activeUsers: ActiveUserQuery, tipRateLimit: TipWeeklyRateLimitPolicy, tipSelection: TipSelectionPolicy, curatedContent: CuratedContentPolicy, sendPush: SendPushNotificationUseCase);
    execute(): Promise<ProcessWeeklyEducationalTipsResult>;
}
