import { Injectable, Logger } from '@nestjs/common';
import { AiResponseNotificationPolicy } from '../../domain/services/ai-response-notification.policy';
import { AssistantReplyReadyEvent } from '../ports/assistant-reply-notification.trigger';
import { buildAiResponseReady } from '../push-notification.templates';
import { SendResult, SendResults } from '../ports/push-notification.provider';
import { SendPushNotificationUseCase } from './send-push-notification.use-case';

@Injectable()
export class NotifyAiResponseReadyUseCase {
  private readonly logger = new Logger(NotifyAiResponseReadyUseCase.name);

  constructor(
    private readonly aiResponsePolicy: AiResponseNotificationPolicy,
    private readonly sendPush: SendPushNotificationUseCase,
  ) {}

  async execute(event: AssistantReplyReadyEvent): Promise<SendResult | void> {
    if (!this.aiResponsePolicy.shouldNotify(event)) {
      this.logger.debug({
        event: 'PushNotificationSkipped',
        reason: 'app_in_foreground',
        conversationId: event.conversationId,
        firebaseUid: event.firebaseUid,
      });
      return SendResults.skipped('app_in_foreground');
    }

    const notification = buildAiResponseReady(event.conversationId);
    const result = await this.sendPush.execute(event.firebaseUid, notification);

    if (result.status === 'sent' || result.status === 'partial') {
      this.logger.log({
        event: 'AiResponseNotificationDispatched',
        conversationId: event.conversationId,
        firebaseUid: event.firebaseUid,
      });
    }

    return result;
  }
}
