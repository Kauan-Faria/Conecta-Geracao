import { GeoPoint } from './geo-point.vo';
import { InvalidGeoPointError } from '../errors/domain.errors';

describe('GeoPoint', () => {
  it('aceita coordenadas válidas', () => {
    const point = GeoPoint.create(-22.9056, -47.0608);
    expect(point.lat).toBe(-22.9056);
    expect(point.lon).toBe(-47.0608);
  });

  it('rejeita latitude inválida', () => {
    expect(() => GeoPoint.create(91, 0)).toThrow(InvalidGeoPointError);
    expect(() => GeoPoint.create(-91, 0)).toThrow(InvalidGeoPointError);
  });

  it('rejeita longitude inválida', () => {
    expect(() => GeoPoint.create(0, 181)).toThrow(InvalidGeoPointError);
    expect(() => GeoPoint.create(0, -181)).toThrow(InvalidGeoPointError);
  });

  it('compara igualdade', () => {
    const a = GeoPoint.create(-22.9, -47.0);
    const b = GeoPoint.create(-22.9, -47.0);
    expect(a.equals(b)).toBe(true);
  });
});
