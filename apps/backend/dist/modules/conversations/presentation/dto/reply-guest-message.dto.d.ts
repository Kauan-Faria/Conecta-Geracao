export declare class GuestMessageTurnDto {
    role: 'user' | 'assistant';
    content: string;
}
export declare class ReplyGuestMessageDto {
    content: string;
    topicSlug?: string;
    currentStep?: number;
    messageHistory?: GuestMessageTurnDto[];
}
