import { QueryNormalizer } from './query-normalizer';
import { TopicMatch } from '../value-objects/topic-match.vo';
import { MessageSubstance } from '../value-objects/message-substance.vo';

const VACUOUS_TOKENS = new Set([
  'me',
  'ajuda',
  'ajudar',
  'nao',
  'funciona',
  'sei',
  'e',
  'agora',
  'oi',
  'ola',
  'bom',
  'dia',
  'tarde',
  'noite',
  'por',
  'favor',
  'please',
  'help',
  'preciso',
  'ajuda',
  'oi',
  'oie',
  'opa',
  'tudo',
  'bem',
  'obrigado',
  'obrigada',
]);

export class MessageSubstanceClassifier {
  private readonly normalizer = new QueryNormalizer();

  classify(input: {
    message: string;
    match: TopicMatch;
    isCheckpoint: boolean;
    streakCount: number;
  }): MessageSubstance {
    if (input.match.isHigh) {
      return 'catalog';
    }
    if (input.isCheckpoint && input.streakCount === 0) {
      return 'checkpoint';
    }
    if (input.isCheckpoint && input.streakCount > 0) {
      return 'vacuous';
    }
    if (this.isVacuous(input.message)) {
      return 'vacuous';
    }
    if (input.match.confidence === 'none') {
      return 'outOfCatalog';
    }
    return 'vacuous';
  }

  isVacuous(message: string): boolean {
    const tokens = this.normalizer.normalize(message).tokens;
    if (tokens.length === 0) {
      return true;
    }
    return tokens.every((token) => VACUOUS_TOKENS.has(token));
  }
}
