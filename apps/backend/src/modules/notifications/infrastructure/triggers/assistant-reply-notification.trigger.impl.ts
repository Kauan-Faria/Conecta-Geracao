import { Injectable, Logger } from '@nestjs/common';
import {
  AssistantReplyNotificationTrigger,
  AssistantReplyReadyEvent,
} from '../../application/ports/assistant-reply-notification.trigger';
import { NotifyAiResponseReadyUseCase } from '../../application/use-cases/notify-ai-response-ready.use-case';

@Injectable()
export class AssistantReplyNotificationTriggerImpl implements AssistantReplyNotificationTrigger {
  private readonly logger = new Logger(AssistantReplyNotificationTriggerImpl.name);

  constructor(private readonly notifyAiResponseReady: NotifyAiResponseReadyUseCase) {}

  async onAssistantReplyReady(event: AssistantReplyReadyEvent): Promise<void> {
    try {
      await this.notifyAiResponseReady.execute(event);
    } catch (error) {
      this.logger.error({
        event: 'AssistantReplyNotificationFailed',
        conversationId: event.conversationId,
        firebaseUid: event.firebaseUid,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
