import { InvalidSearchRadiusError } from '../errors/domain.errors';

const ALLOWED_RADIUS_KM = [2, 5, 10] as const;

export class SearchRadius {
  readonly kilometers: number;

  private constructor(kilometers: number) {
    this.kilometers = kilometers;
  }

  static create(raw: number | undefined, defaultKm: number, maxKm: number): SearchRadius {
    const km = raw ?? defaultKm;

    if (!Number.isFinite(km)) {
      throw new InvalidSearchRadiusError();
    }

    if (km > maxKm) {
      throw new InvalidSearchRadiusError(`Raio máximo permitido é ${maxKm} km`);
    }

    if (!ALLOWED_RADIUS_KM.includes(km as (typeof ALLOWED_RADIUS_KM)[number])) {
      throw new InvalidSearchRadiusError('Raio deve ser 2, 5 ou 10 km');
    }

    return new SearchRadius(km);
  }

  toMeters(): number {
    return this.kilometers * 1000;
  }
}
