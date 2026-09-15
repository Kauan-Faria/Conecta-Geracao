import { MessageContent } from '../../domain/value-objects/message-content.vo';
import { ReplyGuestMessageUseCase } from './reply-guest-message.use-case';

describe('ReplyGuestMessageUseCase', () => {
  it('retorna resposta do assistente sem persistir conversa', async () => {
    const replyGenerator = {
      generateReply: jest.fn().mockResolvedValue({
        content: MessageContent.create('Vou te ajudar a encontrar uma farmácia.'),
        nextCurrentStep: 0,
        resolvedTopicSlug: null,
      }),
    };

    const useCase = new ReplyGuestMessageUseCase(replyGenerator as never);

    const result = await useCase.execute({
      content: 'quero uma farmácia perto',
      topicSlug: null,
      currentStep: 0,
      messageHistory: [],
    });

    expect(replyGenerator.generateReply).toHaveBeenCalledWith({
      conversationId: 'guest-ephemeral',
      userMessage: 'quero uma farmácia perto',
      topicSlug: null,
      currentStep: 0,
      messageHistory: [],
    });
    expect(result.role).toBe('assistant');
    expect(result.content).toBe('Vou te ajudar a encontrar uma farmácia.');
    expect(result.currentStep).toBe(0);
  });

  it('propaga slug e replyMode iguais ao generator (paridade)', async () => {
    const replyGenerator = {
      generateReply: jest.fn().mockResolvedValue({
        content: MessageContent.create('Você quer ajuda com Wi-Fi ou com Gov.br?'),
        nextCurrentStep: 2,
        resolvedTopicSlug: 'codigo-govbr',
        replyMode: 'clarify',
      }),
    };
    const useCase = new ReplyGuestMessageUseCase(replyGenerator as never);
    const result = await useCase.execute({
      content: 'código QR',
      topicSlug: 'codigo-govbr',
      currentStep: 2,
      messageHistory: [],
    });
    expect(result.topicSlug).toBe('codigo-govbr');
    expect(result.currentStep).toBe(2);
    expect(result.metadata).toEqual({ replyMode: 'clarify' });
  });
});
