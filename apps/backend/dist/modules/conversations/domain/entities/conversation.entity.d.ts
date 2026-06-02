import { ConversationStatus } from '../value-objects/conversation-status.vo';
import { MessageContent } from '../value-objects/message-content.vo';
import { MessageRole } from '../value-objects/message-role.vo';
export interface MessageProps {
    id?: string;
    conversationId: string;
    role: MessageRole;
    content: MessageContent;
    createdAt?: Date;
}
export declare class Message {
    readonly id?: string;
    readonly conversationId: string;
    readonly role: MessageRole;
    readonly content: MessageContent;
    readonly createdAt: Date;
    private constructor();
    static create(props: MessageProps): Message;
}
export interface ConversationProps {
    id?: string;
    firebaseUid: string;
    topicSlug?: string | null;
    status?: ConversationStatus;
    currentStep?: number;
    createdAt?: Date;
    updatedAt?: Date;
    messages?: Message[];
}
export declare class Conversation {
    readonly id?: string;
    readonly firebaseUid: string;
    readonly topicSlug: string | null;
    readonly status: ConversationStatus;
    readonly currentStep: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly messages: Message[];
    private constructor();
    static create(props: ConversationProps): Conversation;
    assertCanReceiveMessage(): void;
    withMessages(messages: Message[]): Conversation;
}
export type ConversationWithMessages = Conversation & {
    messages: Message[];
};
