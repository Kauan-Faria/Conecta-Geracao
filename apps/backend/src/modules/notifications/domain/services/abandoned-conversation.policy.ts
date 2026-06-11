import { Injectable } from '@nestjs/common';
import { AbandonedConversationSnapshot } from '../../application/ports/abandoned-conversation.query';

@Injectable()
export class AbandonedConversationPolicy {
  isEligible(snapshot: AbandonedConversationSnapshot): boolean {
    return snapshot.status === 'in_progress';
  }
}
