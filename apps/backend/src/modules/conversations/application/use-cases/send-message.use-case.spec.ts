import { SendMessageUseCase } from './send-message.use-case';
import { Conversation } from '../../domain/entities/conversation.entity';
import { ConversationStatus } from '../../domain/value-objects/conversation-status.vo';
import { MessageContent } from '../../domain/value-objects/message-content.vo';
import { MessageRole } from '../../domain/value-objects/message-role.vo';
import { Message } from '../../domain/entities/conversation.entity';
import { ConversationClosedError } from '../../domain/errors/domain.errors';

describe('SendMessageUseCase', () => {
  const conversation = Conversation.create({
    id: 'conv-1',
    firebaseUid: 'user-a',
    status: ConversationStatus.inProgress(),
  });

  const assistantMessage = Message.create({
    id: 'msg-2',
    conversationId: 'conv-1',
    role: MessageRole.assistant(),
    content: MessageContent.create('Resposta stub'),
  });

  it('persiste mensagem user e retorna resposta assistant', async () => {
    const conversations = {
      findByIdForUser: jest.fn().mockResolvedValue(conversation),
    };
    const unitOfWork = {
      sendMessage: jest.fn().mockResolvedValue({ assistantMessage }),
    };
    const messages = { listByConversationId: jest.fn().mockResolvedValue([]) };
    const replyGenerator = {
      generateReply: jest.fn().mockResolvedValue({
        content: MessageContent.create('Resposta stub'),
        nextCurrentStep: 0,
      }),
    };

    const useCase = new SendMessageUseCase(
      conversations as never,
      unitOfWork as never,
      replyGenerator as never,
      messages as never,
      { assertOwner: (c: Conversation | null) => c! } as never,
    );

    const result = await useCase.execute('user-a', 'conv-1', 'Olá');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe('msg-2');
    }
    expect(unitOfWork.sendMessage).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      firebaseUid: 'user-a',
      userContent: 'Olá',
      assistantContent: 'Resposta stub',
      nextCurrentStep: 0,
      topicSlug: null,
    });
  });

  it('retorna erro quando conversa está encerrada', async () => {
    const closed = Conversation.create({
      id: 'conv-1',
      firebaseUid: 'user-a',
      status: ConversationStatus.completed(),
    });

    const useCase = new SendMessageUseCase(
      { findByIdForUser: jest.fn().mockResolvedValue(closed) } as never,
      { sendMessage: jest.fn() } as never,
      { generateReply: jest.fn() } as never,
      { listByConversationId: jest.fn() } as never,
      { assertOwner: (c: Conversation | null) => c! } as never,
    );

    const result = await useCase.execute('user-a', 'conv-1', 'Olá');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ConversationClosedError);
    }
  });
});
