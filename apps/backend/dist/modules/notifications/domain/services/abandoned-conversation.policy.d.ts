import { AbandonedConversationSnapshot } from '../../application/ports/abandoned-conversation.query';
export declare class AbandonedConversationPolicy {
    isEligible(snapshot: AbandonedConversationSnapshot): boolean;
}
