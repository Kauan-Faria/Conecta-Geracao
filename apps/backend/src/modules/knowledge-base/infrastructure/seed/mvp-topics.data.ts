import { KnowledgeTopicProps } from '../../domain/entities/knowledge-topic.entity';

export const MVP_TOPICS_DATA: KnowledgeTopicProps[] = [
  {
    slug: 'fazer-pix',
    title: 'Como fazer um PIX',
    summary: 'Envie dinheiro pelo app do seu banco com segurança.',
    keywords: ['pix', 'transferencia', 'banco', 'pagamento'],
    displayOrder: 1,
    steps: [
      {
        order: 1,
        instruction: 'Abra o app do seu banco no celular.',
        checkpointQuestion: 'Você já abriu o app do banco?',
        checkpointHints: ['sim', 'não', 'ainda não'],
      },
      {
        order: 2,
        instruction: 'Toque em PIX ou Transferir e escolha enviar dinheiro.',
        checkpointQuestion: 'Você encontrou a opção PIX?',
        checkpointHints: ['sim', 'não'],
      },
      {
        order: 3,
        instruction: 'Digite a chave PIX (telefone, e-mail ou CPF) no app do banco.',
        checkpointQuestion: 'Você já colocou a chave no app do banco?',
        checkpointHints: ['sim', 'não'],
      },
      {
        order: 4,
        instruction: 'Confira nome e valor. Toque em confirmar só se estiver certo.',
      },
    ],
  },
  {
    slug: 'codigo-govbr',
    title: 'Código Gov.br (tutorial)',
    summary: 'Entenda o que é o código Gov.br e quando ele é pedido em sites públicos.',
    keywords: ['gov.br', 'codigo', 'governo', 'cadastro'],
    displayOrder: 2,
    steps: [
      {
        order: 1,
        instruction:
          'O Gov.br é o portal do governo. Alguns serviços pedem um código enviado ao seu celular ou e-mail.',
        checkpointQuestion: 'Você já usou algum site do governo no celular?',
        checkpointHints: ['sim', 'não'],
      },
      {
        order: 2,
        instruction:
          'Quando pedirem o código, abra a mensagem no celular e digite os números no site oficial do governo.',
        checkpointQuestion: 'Você recebeu uma mensagem com números?',
        checkpointHints: ['sim', 'não', 'ainda não'],
      },
      {
        order: 3,
        instruction:
          'Use apenas sites que terminam com gov.br. Não compartilhe o código com outras pessoas.',
      },
      {
        order: 4,
        instruction:
          'Se tiver dúvida, peça ajuda a alguém de confiança presencialmente. Este app não acessa o Gov.br por você.',
      },
    ],
  },
  {
    slug: 'whatsapp-contato-localizacao',
    title: 'WhatsApp: contato e localização',
    summary: 'Compartilhe um contato ou sua localização em uma conversa.',
    keywords: ['whatsapp', 'contato', 'localizacao', 'compartilhar'],
    displayOrder: 3,
    steps: [
      {
        order: 1,
        instruction: 'Abra o WhatsApp e entre na conversa com a pessoa.',
        checkpointQuestion: 'Você já está na conversa certa?',
        checkpointHints: ['sim', 'não'],
      },
      {
        order: 2,
        instruction: 'Toque no ícone de clipe ou + ao lado da caixa de mensagem.',
        checkpointQuestion: 'Você viu as opções de anexo?',
        checkpointHints: ['sim', 'não'],
      },
      {
        order: 3,
        instruction: 'Para contato: escolha Contato e selecione a pessoa. Para local: escolha Localização.',
        checkpointQuestion: 'Você escolheu contato ou localização?',
        checkpointHints: ['contato', 'localizacao'],
      },
      {
        order: 4,
        instruction: 'Confira o que vai enviar e toque em enviar.',
      },
    ],
  },
  {
    slug: 'wifi-qr-code',
    title: 'Senha do Wi-Fi via QR Code',
    summary: 'Compartilhe a rede Wi-Fi usando um QR Code no celular ou roteador.',
    keywords: ['wifi', 'qr', 'rede', 'internet'],
    displayOrder: 4,
    steps: [
      {
        order: 1,
        instruction: 'Abra as configurações de Wi-Fi do celular ou do roteador.',
        checkpointQuestion: 'Você está nas configurações de Wi-Fi?',
        checkpointHints: ['sim', 'não'],
      },
      {
        order: 2,
        instruction: 'Procure a opção Compartilhar, QR Code ou Convidar à rede.',
        checkpointQuestion: 'Você encontrou a opção de QR Code?',
        checkpointHints: ['sim', 'não'],
      },
      {
        order: 3,
        instruction: 'Mostre o QR Code para a outra pessoa escanear com a câmera do celular.',
        checkpointQuestion: 'A outra pessoa conseguiu escanear?',
        checkpointHints: ['sim', 'não'],
      },
      {
        order: 4,
        instruction: 'Confirme que o visitante conectou na rede correta antes de sair.',
      },
    ],
  },
  {
    slug: 'segunda-via-boleto',
    title: '2ª via de boleto',
    summary: 'Emita a segunda via pelo app ou site oficial da empresa.',
    keywords: ['boleto', 'segunda via', 'conta', 'pagamento'],
    displayOrder: 5,
    steps: [
      {
        order: 1,
        instruction: 'Abra o app ou site oficial da empresa (banco, loja ou concessionária).',
        checkpointQuestion: 'Você já abriu o app ou site oficial?',
        checkpointHints: ['sim', 'não'],
      },
      {
        order: 2,
        instruction: 'Entre na área de boletos, faturas ou segunda via.',
        checkpointQuestion: 'Você encontrou a área de boletos?',
        checkpointHints: ['sim', 'não'],
      },
      {
        order: 3,
        instruction: 'Selecione a conta ou mês desejado e peça a segunda via.',
        checkpointQuestion: 'O boleto apareceu na tela?',
        checkpointHints: ['sim', 'não'],
      },
      {
        order: 4,
        instruction: 'Pague pelo app do banco ou imprima se precisar. Use canais oficiais.',
      },
    ],
  },
  {
    slug: 'alerta-golpe',
    title: 'Reconhecer possível golpe',
    summary: 'Aprenda sinais de golpe e como se proteger.',
    keywords: ['golpe', 'fraude', 'seguranca', 'link'],
    displayOrder: 6,
    steps: [
      {
        order: 1,
        instruction:
          'Desconfie de mensagens urgentes pedindo dinheiro, códigos ou cliques em links estranhos.',
        checkpointQuestion: 'Você recebeu uma mensagem assim recentemente?',
        checkpointHints: ['sim', 'não'],
      },
      {
        order: 2,
        instruction:
          'Não clique em links de WhatsApp ou SMS de números desconhecidos. Ligue para o banco pelo número do cartão.',
        checkpointQuestion: 'Você conhece quem enviou a mensagem?',
        checkpointHints: ['sim', 'não', 'não sei'],
      },
      {
        order: 3,
        instruction:
          'Bancos e lojas não pedem códigos por mensagem para "desbloquear" conta. Isso costuma ser golpe.',
      },
      {
        order: 4,
        instruction:
          'Em dúvida, pare e peça ajuda a familiar ou à polícia. Não transfira dinheiro sob pressão.',
      },
    ],
  },
];
