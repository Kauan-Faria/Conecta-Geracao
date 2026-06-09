import { GeoPoint } from '../value-objects/geo-point.vo';
import { GeoDistanceCalculator } from './geo-distance-calculator.service';

describe('GeoDistanceCalculator', () => {
  const calculator = new GeoDistanceCalculator();

  it('retorna zero para o mesmo ponto', () => {
    const point = GeoPoint.create(-22.9056, -47.0608);
    expect(calculator.haversineMeters(point, point)).toBe(0);
  });

  it('calcula distância conhecida aproximada', () => {
    const from = GeoPoint.create(-22.9056, -47.0608);
    const to = GeoPoint.create(-22.906, -47.061);
    const meters = calculator.haversineMeters(from, to);
    expect(meters).toBeGreaterThan(0);
    expect(meters).toBeLessThan(2000);
  });
});
