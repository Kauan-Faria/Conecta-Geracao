import { AssistantReplyGenerator } from '../../application/ports/assistant-reply.generator';
import { MessageContent } from '../../domain/value-objects/message-content.vo';
export declare class StubAssistantReplyGenerator implements AssistantReplyGenerator {
    generateReply(input: {
        conversationId: string;
        userMessage: string;
        topicSlug?: string | null;
        currentStep: number;
        messageHistory: Array<{
            role: 'user' | 'assistant';
            content: string;
        }>;
    }): Promise<{
        content: MessageContent;
        nextCurrentStep: number;
    }>;
}
