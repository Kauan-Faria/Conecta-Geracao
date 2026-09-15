import { TopicMatch } from '../value-objects/topic-match.vo';
import { MessageSubstanceClassifier } from './message-substance.classifier';

describe('MessageSubstanceClassifier', () => {
  const classifier = new MessageSubstanceClassifier();

  it('me ajuda é vacuous', () => {
    expect(
      classifier.classify({
        message: 'me ajuda',
        match: TopicMatch.none(),
        isCheckpoint: false,
        streakCount: 0,
      }),
    ).toBe('vacuous');
  });

  it('instagran fora do catálogo', () => {
    expect(
      classifier.classify({
        message: 'como usar o instagran',
        match: TopicMatch.none(),
        isCheckpoint: false,
        streakCount: 0,
      }),
    ).toBe('outOfCatalog');
  });

  it('ok é checkpoint na streak 0', () => {
    expect(
      classifier.classify({
        message: 'ok',
        match: TopicMatch.none(),
        isCheckpoint: true,
        streakCount: 0,
      }),
    ).toBe('checkpoint');
  });

  it('high é catalog', () => {
    expect(
      classifier.classify({
        message: 'wifi',
        match: TopicMatch.high('wifi-qr-code', []),
        isCheckpoint: false,
        streakCount: 0,
      }),
    ).toBe('catalog');
  });
});
