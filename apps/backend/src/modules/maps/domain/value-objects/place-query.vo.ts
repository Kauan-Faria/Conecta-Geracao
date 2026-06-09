import { InvalidPlaceQueryError } from '../errors/domain.errors';

export class PlaceQuery {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): PlaceQuery {
    const trimmed = raw.trim();
    if (trimmed.length < 2) {
      throw new InvalidPlaceQueryError('Consulta deve ter pelo menos 2 caracteres');
    }
    if (trimmed.length > 200) {
      throw new InvalidPlaceQueryError('Consulta deve ter no máximo 200 caracteres');
    }
    return new PlaceQuery(trimmed);
  }
}
