import { AssistantReplyGenerator, AssistantMessageTurn } from '../ports/assistant-reply.generator';
import { MessageMetadata } from '../../domain/value-objects/message-metadata.vo';
export interface GuestAssistantReply {
    id: string;
    role: 'assistant';
    content: string;
    currentStep: number;
    topicSlug: string | null;
    metadata: ReturnType<typeof MessageMetadata.fromMapAction> | null;
    createdAt: string;
}
export declare class ReplyGuestMessageUseCase {
    private readonly replyGenerator;
    constructor(replyGenerator: AssistantReplyGenerator);
    execute(input: {
        content: string;
        topicSlug?: string | null;
        currentStep: number;
        messageHistory: AssistantMessageTurn[];
    }): Promise<GuestAssistantReply>;
}
