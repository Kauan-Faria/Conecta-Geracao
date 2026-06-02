import { GeminiAssistantReplyGenerator } from './gemini-assistant-reply.generator';
import { KnowledgeContext } from '../../application/ports/knowledge-retriever';

describe('GeminiAssistantReplyGenerator', () => {
  const knowledgeContext: KnowledgeContext = {
    topicSlug: 'fazer-pix',
    topicTitle: 'PIX',
    summary: 'Envie dinheiro',
    steps: [
      { order: 1, instruction: 'Abra o app', checkpointQuestion: 'Abriu?' },
      { order: 2, instruction: 'Toque em PIX', checkpointQuestion: null },
    ],
    availableTopics: [{ slug: 'fazer-pix', title: 'PIX' }],
    inferredFromMessage: false,
  };

  it('bloqueia input sensível sem chamar LLM', async () => {
    const llm = { generate: jest.fn() };
    const retriever = { retrieve: jest.fn() };

    const generator = new GeminiAssistantReplyGenerator(
      retriever as never,
      llm as never,
    );

    const result = await generator.generateReply({
      conversationId: 'c1',
      userMessage: 'minha senha é abc',
      topicSlug: 'fazer-pix',
      currentStep: 0,
      messageHistory: [],
    });

    expect(llm.generate).not.toHaveBeenCalled();
    expect(result.content.value).toContain('segurança');
  });

  it('avança currentStep quando usuário confirma', async () => {
    const llm = {
      generate: jest.fn().mockResolvedValue('Ótimo! Agora toque em PIX.'),
    };
    const retriever = {
      retrieve: jest.fn().mockResolvedValue(knowledgeContext),
    };

    const generator = new GeminiAssistantReplyGenerator(
      retriever as never,
      llm as never,
    );

    const result = await generator.generateReply({
      conversationId: 'c1',
      userMessage: 'sim',
      topicSlug: 'fazer-pix',
      currentStep: 0,
      messageHistory: [],
    });

    expect(result.nextCurrentStep).toBe(1);
    expect(llm.generate).toHaveBeenCalled();
  });
});
