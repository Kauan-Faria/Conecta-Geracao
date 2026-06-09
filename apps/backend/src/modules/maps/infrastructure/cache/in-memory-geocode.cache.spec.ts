import { GeocodeResult } from '../../domain/entities/maps.entities';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { InMemoryGeocodeCache } from './in-memory-geocode.cache';

describe('InMemoryGeocodeCache', () => {
  const cache = new InMemoryGeocodeCache();
  const sample = GeocodeResult.create({
    point: GeoPoint.create(-22.9, -47.0),
    displayName: 'Centro',
  });

  it('armazena e recupera geocode forward', () => {
    cache.setForward('forward:centro', sample, 60_000);
    expect(cache.getForward('forward:centro', 60_000)?.displayName).toBe('Centro');
  });

  it('armazena e recupera reverse geocode', () => {
    cache.setReverse('reverse:-22.9:-47', sample, 60_000);
    expect(cache.getReverse('reverse:-22.9:-47', 60_000)?.displayName).toBe('Centro');
  });

  it('expira entrada após TTL', () => {
    jest.spyOn(Date, 'now').mockReturnValueOnce(1_000).mockReturnValueOnce(70_000);
    cache.setForward('forward:expira', sample, 60_000);
    expect(cache.getForward('forward:expira', 60_000)).toBeNull();
    jest.restoreAllMocks();
  });
});
