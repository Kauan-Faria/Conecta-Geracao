import { GeoPoint } from '../value-objects/geo-point.vo';
import { GeoDistanceCalculator } from './geo-distance-calculator.service';
import { OsmResponseNormalizer } from './osm-response-normalizer.service';

describe('OsmResponseNormalizer', () => {
  const normalizer = new OsmResponseNormalizer(new GeoDistanceCalculator());
  const center = GeoPoint.create(-22.9056, -47.0608);

  it('normaliza node com nome e endereço', () => {
    const results = normalizer.normalizePois(
      [
        {
          type: 'node',
          id: 123,
          lat: -22.906,
          lon: -47.061,
          tags: {
            name: 'Farmácia Central',
            'addr:street': 'Rua A',
            'addr:housenumber': '10',
          },
        },
      ],
      center,
    );

    expect(results).toHaveLength(1);
    expect(results[0].osmId).toBe('node/123');
    expect(results[0].name).toBe('Farmácia Central');
    expect(results[0].distanceMeters).toBeGreaterThan(0);
  });

  it('usa fallback quando nome ausente', () => {
    const results = normalizer.normalizePois(
      [
        {
          type: 'node',
          id: 456,
          lat: -22.906,
          lon: -47.061,
          tags: {},
        },
      ],
      center,
    );

    expect(results[0].name).toBe('Local sem nome');
  });

  it('ordena por distância ascendente', () => {
    const results = normalizer.normalizePois(
      [
        { type: 'node', id: 1, lat: -22.91, lon: -47.07, tags: { name: 'Longe' } },
        { type: 'node', id: 2, lat: -22.9057, lon: -47.0609, tags: { name: 'Perto' } },
      ],
      center,
    );

    expect(results[0].name).toBe('Perto');
    expect(results[1].name).toBe('Longe');
  });
});
