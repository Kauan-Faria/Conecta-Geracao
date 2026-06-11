import { AssistantReplyNotificationTrigger, AssistantReplyReadyEvent } from '../../application/ports/assistant-reply-notification.trigger';
import { NotifyAiResponseReadyUseCase } from '../../application/use-cases/notify-ai-response-ready.use-case';
export declare class AssistantReplyNotificationTriggerImpl implements AssistantReplyNotificationTrigger {
    private readonly notifyAiResponseReady;
    private readonly logger;
    constructor(notifyAiResponseReady: NotifyAiResponseReadyUseCase);
    onAssistantReplyReady(event: AssistantReplyReadyEvent): Promise<void>;
}
