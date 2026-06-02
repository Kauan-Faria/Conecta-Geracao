import { RagPromptBuilder } from './rag-prompt.builder';

describe('RagPromptBuilder', () => {
  const builder = new RagPromptBuilder();

  it('inclui checkpoint no prompt do passo ativo', () => {
    const prompt = builder.buildUserPrompt({
      knowledge: {
        topicSlug: 'fazer-pix',
        topicTitle: 'PIX',
        summary: 'Envie dinheiro',
        steps: [
          {
            order: 1,
            instruction: 'Abra o app do banco',
            checkpointQuestion: 'Você abriu o app?',
          },
        ],
        availableTopics: [],
        inferredFromMessage: false,
      },
      currentStep: 0,
      checkpointDecision: 'unchanged',
      userMessage: 'oi',
      messageHistory: [],
    });

    expect(prompt).toContain('[Checkpoint: Você abriu o app?]');
    expect(builder.buildSystemPrompt()).toContain('NUNCA');
  });
});
