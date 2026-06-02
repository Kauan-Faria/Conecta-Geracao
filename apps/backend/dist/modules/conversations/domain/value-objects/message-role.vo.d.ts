export type MessageRoleValue = 'user' | 'assistant';
export declare class MessageRole {
    readonly value: MessageRoleValue;
    private constructor();
    static user(): MessageRole;
    static assistant(): MessageRole;
    static from(value: MessageRoleValue): MessageRole;
}
