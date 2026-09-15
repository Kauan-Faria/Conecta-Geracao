import { GeminiAssistantReplyGenerator } from './gemini-assistant-reply.generator';
import { KnowledgeContext } from '../../application/ports/knowledge-retriever';
import { TopicMatch } from '../../domain/value-objects/topic-match.vo';
import { TOPIC_CATALOG } from '../../domain/testing/relevance-corpus';
import { KnowledgeTopic } from '../../../knowledge-base/domain/entities/knowledge-topic.entity';
import { TopicSlug } from '../../../knowledge-base/domain/value-objects/topic-slug.vo';
import { MVP_TOPICS_DATA } from '../../../knowledge-base/infrastructure/seed/mvp-topics.data';
import { PrismaKnowledgeRetriever } from '../knowledge/prisma-knowledge-retriever';

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

  const emptyContext: KnowledgeContext = {
    topicSlug: null,
    topicTitle: null,
    summary: null,
    steps: [],
    availableTopics: TOPIC_CATALOG,
    inferredFromMessage: false,
  };

  const wifiContext: KnowledgeContext = {
    topicSlug: 'wifi-qr-code',
    topicTitle: 'Wi-Fi',
    summary: 'QR',
    steps: [{ order: 1, instruction: 'Abra o Wi-Fi', checkpointQuestion: null }],
    availableTopics: TOPIC_CATALOG,
    inferredFromMessage: true,
  };

  function knowledgeMock(options: {
    match: TopicMatch;
    retrieve?: KnowledgeContext;
  }) {
    return {
      inferMatch: jest.fn().mockResolvedValue({ match: options.match, catalog: TOPIC_CATALOG }),
      retrieve: jest.fn().mockResolvedValue(options.retrieve ?? emptyContext),
    };
  }

  it('bloqueia input sensível sem chamar LLM', async () => {
    const llm = { generate: jest.fn() };
    const retriever = knowledgeMock({ match: TopicMatch.none() });

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
    expect(retriever.inferMatch).not.toHaveBeenCalled();
    expect(result.content.value).toContain('segurança');
  });

  it('avança currentStep quando usuário confirma', async () => {
    const llm = {
      generate: jest.fn().mockResolvedValue('Ótimo! Agora toque em PIX.'),
    };
    const retriever = knowledgeMock({
      match: TopicMatch.none(),
      retrieve: knowledgeContext,
    });

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
    expect(result.replyMode).toBe('rag');
    expect(llm.generate).toHaveBeenCalled();
    expect(retriever.retrieve).toHaveBeenCalled();
  });

  it('emite mapAction para farmácia próxima', async () => {
    const llm = {
      generate: jest.fn().mockResolvedValue('Vou procurar farmácias perto de você.'),
    };
    const retriever = knowledgeMock({ match: TopicMatch.none() });

    const generator = new GeminiAssistantReplyGenerator(
      retriever as never,
      llm as never,
    );

    const result = await generator.generateReply({
      conversationId: 'c1',
      userMessage: 'qual farmácia mais próxima?',
      topicSlug: null,
      currentStep: 0,
      messageHistory: [],
    });

    expect(retriever.retrieve).not.toHaveBeenCalled();
    expect(result.mapAction?.category.value).toBe('pharmacy');
    expect(result.mapAction?.radius.kilometers).toBe(5);
  });

  it('não emite mapAction para saúde ambígua', async () => {
    const llm = { generate: jest.fn() };
    const retriever = knowledgeMock({ match: TopicMatch.none() });

    const generator = new GeminiAssistantReplyGenerator(
      retriever as never,
      llm as never,
    );

    const result = await generator.generateReply({
      conversationId: 'c1',
      userMessage: 'preciso de saúde perto',
      topicSlug: null,
      currentStep: 0,
      messageHistory: [],
    });

    expect(result.mapAction).toBeUndefined();
    expect(result.content.value).toContain('UBS');
  });

  it('não emite mapAction para PIX', async () => {
    const llm = {
      generate: jest.fn().mockResolvedValue('Para fazer PIX, abra o app do banco.'),
    };
    const retriever = knowledgeMock({
      match: TopicMatch.high('fazer-pix', [{ slug: 'fazer-pix', score: 6, matchedTerms: ['pix'] }]),
      retrieve: knowledgeContext,
    });

    const generator = new GeminiAssistantReplyGenerator(
      retriever as never,
      llm as never,
    );

    const result = await generator.generateReply({
      conversationId: 'c1',
      userMessage: 'como fazer PIX?',
      topicSlug: null,
      currentStep: 0,
      messageHistory: [],
    });

    expect(result.mapAction).toBeUndefined();
    expect(retriever.retrieve).toHaveBeenCalled();
  });

  it('troca resolvedTopicSlug quando o retriever infere outro tópico', async () => {
    const llm = {
      generate: jest.fn().mockResolvedValue('Vamos no Wi-Fi.'),
    };
    const retriever = knowledgeMock({
      match: TopicMatch.high('wifi-qr-code', [
        { slug: 'wifi-qr-code', score: 8, matchedTerms: ['wifi'] },
      ]),
      retrieve: wifiContext,
    });

    const generator = new GeminiAssistantReplyGenerator(
      retriever as never,
      llm as never,
    );

    const result = await generator.generateReply({
      conversationId: 'c1',
      userMessage: 'como passar o wi-fi por qr',
      topicSlug: 'codigo-govbr',
      currentStep: 3,
      messageHistory: [],
    });

    expect(result.resolvedTopicSlug).toBe('wifi-qr-code');
    expect(result.nextCurrentStep).toBe(0);
    expect(result.replyMode).toBe('rag');
    const prompt = (llm.generate as jest.Mock).mock.calls[0][0].userPrompt as string;
    expect(prompt).toContain('wifi-qr-code');
    expect(prompt).not.toContain('codigo-govbr');
  });

  it('empate código QR → clarify, sem retrieve nem LLM', async () => {
    const llm = { generate: jest.fn() };
    const retriever = knowledgeMock({
      match: TopicMatch.tie([
        { slug: 'wifi-qr-code', score: 4, matchedTerms: ['qr'] },
        { slug: 'codigo-govbr', score: 3, matchedTerms: ['codigo'] },
      ]),
    });

    const generator = new GeminiAssistantReplyGenerator(
      retriever as never,
      llm as never,
    );

    const result = await generator.generateReply({
      conversationId: 'c1',
      userMessage: 'código QR',
      topicSlug: null,
      currentStep: 0,
      messageHistory: [],
    });

    expect(result.replyMode).toBe('clarify');
    expect(result.resolvedTopicSlug).toBeNull();
    expect(retriever.retrieve).not.toHaveBeenCalled();
    expect(llm.generate).not.toHaveBeenCalled();
    expect(result.content.value).toContain('ou com');
  });

  it('Instagram → general, steps vazios no prompt, slug null', async () => {
    const llm = {
      generate: jest.fn().mockResolvedValue('Abra o app do Instagram e toque em cadastrar.'),
    };
    const retriever = knowledgeMock({ match: TopicMatch.none() });

    const generator = new GeminiAssistantReplyGenerator(
      retriever as never,
      llm as never,
    );

    const result = await generator.generateReply({
      conversationId: 'c1',
      userMessage: 'como usar o Instagram',
      topicSlug: 'wifi-qr-code',
      currentStep: 2,
      messageHistory: [],
    });

    expect(result.replyMode).toBe('general');
    expect(result.resolvedTopicSlug).toBeNull();
    expect(result.nextCurrentStep).toBe(0);
    expect(retriever.retrieve).not.toHaveBeenCalled();
    expect(llm.generate).toHaveBeenCalled();
    const call = (llm.generate as jest.Mock).mock.calls[0][0] as {
      systemPrompt: string;
      userPrompt: string;
    };
    expect(call.systemPrompt.toLowerCase()).toContain('orientação geral');
    expect(call.userPrompt).not.toContain('Abra o Wi-Fi');
    expect(call.userPrompt).not.toContain('portal do governo');
    expect(call.userPrompt).not.toContain('Toque em PIX');
  });

  it('integra retriever real: Gov.br → Wi-Fi no prompt e currentStep 0', async () => {
    const topics = MVP_TOPICS_DATA.map((data) => KnowledgeTopic.create(data));
    const retriever = new PrismaKnowledgeRetriever({
      findAllActive: jest.fn().mockResolvedValue(topics),
      findBySlug: jest.fn(async (slug: TopicSlug) => {
        return topics.find((topic) => topic.slug === slug.value) ?? null;
      }),
    } as never);
    const llm = { generate: jest.fn().mockResolvedValue('Vamos no Wi-Fi.') };
    const generator = new GeminiAssistantReplyGenerator(retriever, llm as never);

    const result = await generator.generateReply({
      conversationId: 'c1',
      userMessage: 'como passo a senha do wi-fi',
      topicSlug: 'codigo-govbr',
      currentStep: 3,
      messageHistory: [],
    });

    expect(result.replyMode).toBe('rag');
    expect(result.resolvedTopicSlug).toBe('wifi-qr-code');
    expect(result.nextCurrentStep).toBe(0);
    const prompt = (llm.generate as jest.Mock).mock.calls[0][0].userPrompt as string;
    expect(prompt).toContain('wifi-qr-code');
    expect(prompt.toLowerCase()).not.toContain('codigo-govbr');
    expect(prompt).not.toContain('portal do governo');
  });
});
