import { GeoPoint } from '../value-objects/geo-point.vo';

const EARTH_RADIUS_METERS = 6_371_000;

export class GeoDistanceCalculator {
  haversineMeters(from: GeoPoint, to: GeoPoint): number {
    const lat1 = this.toRadians(from.lat);
    const lat2 = this.toRadians(to.lat);
    const deltaLat = this.toRadians(to.lat - from.lat);
    const deltaLon = this.toRadians(to.lon - from.lon);

    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(EARTH_RADIUS_METERS * c);
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
