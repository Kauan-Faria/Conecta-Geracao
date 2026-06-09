import { SearchQuery } from './search-query.vo';
import { InvalidSearchQueryError } from '../errors/domain.errors';

describe('SearchQuery', () => {
  it('aceita query com 2 ou mais caracteres', () => {
    const query = SearchQuery.create('  pix  ');
    expect(query.value).toBe('pix');
  });

  it('rejeita query com menos de 2 caracteres', () => {
    expect(() => SearchQuery.create('a')).toThrow(InvalidSearchQueryError);
    expect(() => SearchQuery.create('   ')).toThrow(InvalidSearchQueryError);
  });

  it('rejeita query com mais de 100 caracteres', () => {
    expect(() => SearchQuery.create('x'.repeat(101))).toThrow(InvalidSearchQueryError);
  });
});
