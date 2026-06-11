import { PoiResponseNormalizer } from './poi-response-normalizer.service';
import { GeoDistanceCalculator } from './geo-distance-calculator.service';
import { GeoPoint } from '../value-objects/geo-point.vo';

describe('PoiResponseNormalizer', () => {
  const normalizer = new PoiResponseNormalizer(new GeoDistanceCalculator());
  const center = GeoPoint.create(-22.9056, -47.0608);

  it('normaliza POIs e ordena por distância', () => {
    const results = normalizer.normalizePois(
      [
        {
          externalId: 'ChIJfar',
          name: 'Farmácia B',
          address: 'Rua B',
          lat: -22.908,
          lon: -47.063,
        },
        {
          externalId: 'ChIJnear',
          name: 'Farmácia A',
          address: 'Rua A',
          lat: -22.906,
          lon: -47.061,
        },
      ],
      center,
    );

    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('Farmácia A');
    expect(results[0].osmId).toBe('ChIJnear');
    expect(results[1].name).toBe('Farmácia B');
  });

  it('usa fallback de nome quando ausente', () => {
    const results = normalizer.normalizePois(
      [
        {
          externalId: 'ChIJ1',
          name: '',
          address: 'Rua Exemplo, 100',
          lat: -22.906,
          lon: -47.061,
        },
      ],
      center,
    );

    expect(results[0].name).toBe('Rua Exemplo, 100');
  });

  it('usa "Local sem nome" quando nome e endereço ausentes', () => {
    const results = normalizer.normalizePois(
      [
        {
          externalId: 'ChIJ1',
          name: '',
          address: '',
          lat: -22.906,
          lon: -47.061,
        },
      ],
      center,
    );

    expect(results[0].name).toBe('Local sem nome');
  });
});
