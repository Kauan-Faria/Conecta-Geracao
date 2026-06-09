import { LocationIntentClassifier } from './location-intent.classifier';

describe('LocationIntentClassifier', () => {
  const classifier = new LocationIntentClassifier();

  it('detecta intenção geográfica para farmácia', () => {
    const result = classifier.analyze('qual farmácia mais próxima?');
    expect(result.isGeographic).toBe(true);
  });

  it('não detecta intenção geográfica para PIX', () => {
    const result = classifier.analyze('como fazer PIX?');
    expect(result.isGeographic).toBe(false);
  });

  it('marca saúde como ambígua', () => {
    const result = classifier.analyze('preciso de saúde perto');
    expect(result.isGeographic).toBe(true);
    expect(result.isAmbiguousHealth).toBe(true);
  });
});
