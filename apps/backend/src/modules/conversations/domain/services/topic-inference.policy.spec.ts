import { TopicInferencePolicy } from './topic-inference.policy';
import { MVP_TOPICS_DATA } from '../../../knowledge-base/infrastructure/seed/mvp-topics.data';
import { NEGATIVE_PAIRS } from '../testing/relevance-corpus';

describe('TopicInferencePolicy', () => {
  const policy = new TopicInferencePolicy();

  const topics = MVP_TOPICS_DATA.map((topic) => ({
    slug: topic.slug,
    keywords: topic.keywords,
    aliases: topic.aliases ?? [],
  }));

  const mini = [
    { slug: 'fazer-pix', keywords: ['pix', 'transferencia'] },
    { slug: 'alerta-golpe', keywords: ['golpe', 'fraude'] },
  ];

  it('infere fazer-pix por keyword', () => {
    expect(policy.inferSlug('quero fazer um pix', mini)).toBe('fazer-pix');
  });

  it('retorna null sem match', () => {
    expect(policy.inferSlug('bom dia', mini)).toBeNull();
    expect(policy.infer('bom dia', mini).confidence).toBe('none');
  });

  describe('corpus FR-2', () => {
    it.each([
      ['wifi', 'wifi-qr-code'],
      ['wi-fi', 'wifi-qr-code'],
      ['wi fi', 'wifi-qr-code'],
      ['uifi', 'wifi-qr-code'],
      ['wify', 'wifi-qr-code'],
      ['wiffi', 'wifi-qr-code'],
      ['senha do wifi', 'wifi-qr-code'],
      ['qr do wifi', 'wifi-qr-code'],
      ['rede wifi', 'wifi-qr-code'],
      ['gov.br', 'codigo-govbr'],
      ['govbr', 'codigo-govbr'],
      ['gov br', 'codigo-govbr'],
      ['goovi', 'codigo-govbr'],
      ['governo', 'codigo-govbr'],
      ['codigo do gov', 'codigo-govbr'],
      ['gov brasi', 'codigo-govbr'],
      ['whatsapp', 'whatsapp-contato-localizacao'],
      ['whatsap', 'whatsapp-contato-localizacao'],
      ['watsap', 'whatsapp-contato-localizacao'],
      ['uatsap', 'whatsapp-contato-localizacao'],
      ['zap', 'whatsapp-contato-localizacao'],
      ['whats', 'whatsapp-contato-localizacao'],
      ['watzap', 'whatsapp-contato-localizacao'],
      ['pix', 'fazer-pix'],
      ['pics', 'fazer-pix'],
      ['pixx', 'fazer-pix'],
      ['fazer um pix', 'fazer-pix'],
      ['pikis', 'fazer-pix'],
      ['boleto', 'segunda-via-boleto'],
      ['boletu', 'segunda-via-boleto'],
      ['boletoo', 'segunda-via-boleto'],
      ['segunda via', 'segunda-via-boleto'],
      ['2 via', 'segunda-via-boleto'],
      ['conta atrasada', 'segunda-via-boleto'],
      ['golpe', 'alerta-golpe'],
      ['golpi', 'alerta-golpe'],
      ['fraude', 'alerta-golpe'],
      ['mensagem estranha', 'alerta-golpe'],
      ['link suspeito', 'alerta-golpe'],
    ])('%s → %s', (message, slug) => {
      const match = policy.infer(message, topics);
      expect(match.confidence).toBe('high');
      expect(match.slug).toBe(slug);
    });
  });

  describe('pares negativos FR-8', () => {
    it.each(NEGATIVE_PAIRS)('$message → $slug (não $forbidden)', ({ message, slug, forbidden }) => {
      const match = policy.infer(message, topics);
      expect(match.slug).toBe(slug);
      expect(match.slug).not.toBe(forbidden);
    });
  });

  it('código QR do wifi escolhe Wi-Fi, não Gov.br', () => {
    const match = policy.infer('código QR do wifi', topics);
    expect(match.slug).toBe('wifi-qr-code');
    expect(match.confidence).toBe('high');
  });

  it('código do governo escolhe Gov.br', () => {
    expect(policy.infer('código do governo', topics).slug).toBe('codigo-govbr');
  });

  it('só código não escolhe Gov.br com high', () => {
    const match = policy.infer('código', topics);
    expect(match.confidence).not.toBe('high');
    expect(match.slug).toBeNull();
  });

  it.each(['cadastro', 'internet', 'pagamento', 'rede'])(
    'genérica "%s" sozinha não fecha tópico high',
    (word) => {
      const match = policy.infer(word, topics);
      expect(match.confidence).not.toBe('high');
      expect(match.slug).toBeNull();
    },
  );

  it('inferência de 200 mensagens do corpus fica abaixo de 50ms p95 (NFR)', () => {
    const samples = [
      'wi-fi',
      'uifi',
      'govbr',
      'watsap',
      'pixx',
      'boletu',
      'golpi',
      'bom dia',
      'código QR do wifi',
    ];
    const times: number[] = [];
    for (let i = 0; i < 200; i += 1) {
      const message = samples[i % samples.length];
      const started = process.hrtime.bigint();
      policy.infer(message, topics);
      const elapsedNs = Number(process.hrtime.bigint() - started);
      times.push(elapsedNs / 1_000_000);
    }
    times.sort((a, b) => a - b);
    const p95 = times[Math.floor(times.length * 0.95)];
    expect(p95).toBeLessThan(50);
  });

  it('código QR sem wifi não usa displayOrder para eleger Gov.br', () => {
    const match = policy.infer('código QR', topics);
    expect(match.slug).not.toBe('codigo-govbr');
    expect(match.confidence === 'tie' || match.confidence === 'low' || match.slug === 'wifi-qr-code').toBe(
      true,
    );
  });
});
