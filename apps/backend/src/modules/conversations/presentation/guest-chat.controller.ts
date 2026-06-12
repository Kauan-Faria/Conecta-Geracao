import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ReplyGuestMessageUseCase } from '../application/use-cases/reply-guest-message.use-case';
import { ReplyGuestMessageDto } from './dto/reply-guest-message.dto';

@ApiTags('guest-chat')
@Controller('guest/chat')
export class GuestChatController {
  constructor(private readonly replyGuestMessage: ReplyGuestMessageUseCase) {}

  @Post('messages')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Enviar mensagem como convidado e receber resposta do assistente (sem persistência)',
  })
  async reply(@Body() dto: ReplyGuestMessageDto) {
    return this.replyGuestMessage.execute({
      content: dto.content,
      topicSlug: dto.topicSlug ?? null,
      currentStep: dto.currentStep ?? 0,
      messageHistory: dto.messageHistory ?? [],
    });
  }
}
