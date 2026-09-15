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

  it('prompt de Wi-Fi não contém passos de Gov.br', () => {
    const prompt = builder.buildUserPrompt({
      knowledge: {
        topicSlug: 'wifi-qr-code',
        topicTitle: 'Senha do Wi-Fi via QR Code',
        summary: 'Compartilhe a rede Wi-Fi',
        steps: [
          {
            order: 1,
            instruction: 'Abra as configurações de Wi-Fi do celular.',
            checkpointQuestion: 'Você está nas configurações de Wi-Fi?',
          },
        ],
        availableTopics: [],
        inferredFromMessage: true,
      },
      currentStep: 0,
      checkpointDecision: 'unchanged',
      userMessage: 'senha do wi-fi',
      messageHistory: [],
    });

    expect(prompt).toContain('wifi-qr-code');
    expect(prompt).toContain('Wi-Fi');
    expect(prompt.toLowerCase()).not.toContain('codigo-govbr');
    expect(prompt).not.toContain('portal do governo');
  });

  it('prompt general declara orientação geral e não lista passos oficiais', () => {
    const system = builder.buildGeneralSystemPrompt(
      'Você está em modo orientação geral — NÃO use a base oficial.',
    );
    const user = builder.buildGeneralUserPrompt({
      userMessage: 'como usar o Instagram',
      messageHistory: [],
    });

    expect(system.toLowerCase()).toContain('orientação geral');
    expect(user).not.toContain('wifi-qr-code');
    expect(user).not.toContain('codigo-govbr');
    expect(user).not.toContain('fazer-pix');
    expect(user).not.toContain('Passos oficiais');
  });
});
