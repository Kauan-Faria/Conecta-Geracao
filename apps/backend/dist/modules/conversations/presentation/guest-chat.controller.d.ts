import { ReplyGuestMessageUseCase } from '../application/use-cases/reply-guest-message.use-case';
import { ReplyGuestMessageDto } from './dto/reply-guest-message.dto';
export declare class GuestChatController {
    private readonly replyGuestMessage;
    constructor(replyGuestMessage: ReplyGuestMessageUseCase);
    reply(dto: ReplyGuestMessageDto): Promise<import("../application/use-cases/reply-guest-message.use-case").GuestAssistantReply>;
}
