import { PlaceQuery } from './place-query.vo';
import { InvalidPlaceQueryError } from '../errors/domain.errors';

describe('PlaceQuery', () => {
  it('aceita query válida com trim', () => {
    expect(PlaceQuery.create('  Centro, Campinas  ').value).toBe('Centro, Campinas');
  });

  it('rejeita query curta', () => {
    expect(() => PlaceQuery.create('a')).toThrow(InvalidPlaceQueryError);
  });

  it('rejeita query longa', () => {
    expect(() => PlaceQuery.create('x'.repeat(201))).toThrow(InvalidPlaceQueryError);
  });
});
