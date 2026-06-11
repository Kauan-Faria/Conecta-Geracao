import { Injectable } from '@nestjs/common';
import { AssistantReplyReadyEvent } from '../../application/ports/assistant-reply-notification.trigger';

@Injectable()
export class AiResponseNotificationPolicy {
  shouldNotify(event: AssistantReplyReadyEvent): boolean {
    return event.appInBackground;
  }
}
