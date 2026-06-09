import { InvalidGeoPointError } from '../errors/domain.errors';

export class GeoPoint {
  readonly lat: number;
  readonly lon: number;

  private constructor(lat: number, lon: number) {
    this.lat = lat;
    this.lon = lon;
  }

  static create(lat: number, lon: number): GeoPoint {
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      throw new InvalidGeoPointError('Latitude deve estar entre -90 e 90');
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      throw new InvalidGeoPointError('Longitude deve estar entre -180 e 180');
    }
    return new GeoPoint(
      Math.round(lat * 1_000_000) / 1_000_000,
      Math.round(lon * 1_000_000) / 1_000_000,
    );
  }

  equals(other: GeoPoint): boolean {
    return this.lat === other.lat && this.lon === other.lon;
  }
}
