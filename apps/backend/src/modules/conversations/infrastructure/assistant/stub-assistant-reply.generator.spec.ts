import { StubAssistantReplyGenerator } from './stub-assistant-reply.generator';

describe('StubAssistantReplyGenerator', () => {
  it('retorna resposta determinística com eco da mensagem', async () => {
    const generator = new StubAssistantReplyGenerator();
    const reply = await generator.generateReply({
      conversationId: 'conv-1',
      userMessage: 'Como faço Pix?',
      topicSlug: 'fazer-pix',
      currentStep: 0,
      messageHistory: [],
    });

    expect(reply.content.value).toContain('Como faço Pix?');
    expect(reply.content.value).toContain('fazer-pix');
    expect(reply.content.value).toContain('Resposta automática');
  });
});
