import { InvalidSearchQueryError } from '../errors/domain.errors';

export class SearchQuery {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): SearchQuery {
    const trimmed = raw.trim();
    if (trimmed.length < 2) {
      throw new InvalidSearchQueryError();
    }
    if (trimmed.length > 100) {
      throw new InvalidSearchQueryError('Busca deve ter no máximo 100 caracteres');
    }
    return new SearchQuery(trimmed);
  }
}
