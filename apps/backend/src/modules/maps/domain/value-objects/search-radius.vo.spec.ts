import { SearchRadius } from './search-radius.vo';
import { InvalidSearchRadiusError } from '../errors/domain.errors';

describe('SearchRadius', () => {
  it('usa default quando raio omitido', () => {
    const radius = SearchRadius.create(undefined, 5, 10);
    expect(radius.kilometers).toBe(5);
    expect(radius.toMeters()).toBe(5000);
  });

  it.each([2, 5, 10] as const)('aceita raio %s km', (km) => {
    expect(SearchRadius.create(km, 5, 10).kilometers).toBe(km);
  });

  it('rejeita raio acima do máximo', () => {
    expect(() => SearchRadius.create(10, 5, 5)).toThrow(InvalidSearchRadiusError);
  });

  it('rejeita raio fora da lista permitida', () => {
    expect(() => SearchRadius.create(3, 5, 10)).toThrow(InvalidSearchRadiusError);
  });
});
