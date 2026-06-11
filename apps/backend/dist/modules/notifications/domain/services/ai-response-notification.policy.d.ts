import { AssistantReplyReadyEvent } from '../../application/ports/assistant-reply-notification.trigger';
export declare class AiResponseNotificationPolicy {
    shouldNotify(event: AssistantReplyReadyEvent): boolean;
}
