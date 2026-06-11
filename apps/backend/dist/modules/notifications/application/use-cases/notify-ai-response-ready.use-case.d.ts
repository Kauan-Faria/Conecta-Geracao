import { AiResponseNotificationPolicy } from '../../domain/services/ai-response-notification.policy';
import { AssistantReplyReadyEvent } from '../ports/assistant-reply-notification.trigger';
import { SendResult } from '../ports/push-notification.provider';
import { SendPushNotificationUseCase } from './send-push-notification.use-case';
export declare class NotifyAiResponseReadyUseCase {
    private readonly aiResponsePolicy;
    private readonly sendPush;
    private readonly logger;
    constructor(aiResponsePolicy: AiResponseNotificationPolicy, sendPush: SendPushNotificationUseCase);
    execute(event: AssistantReplyReadyEvent): Promise<SendResult | void>;
}
