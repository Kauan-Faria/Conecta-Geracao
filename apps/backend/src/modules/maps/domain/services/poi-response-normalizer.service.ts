import { PoiResult } from '../entities/maps.entities';
import { GeoPoint } from '../value-objects/geo-point.vo';
import { GeoDistanceCalculator } from './geo-distance-calculator.service';

export interface ExternalPoiEntry {
  externalId: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
}

export class PoiResponseNormalizer {
  constructor(private readonly distanceCalculator: GeoDistanceCalculator) {}

  normalizePois(raw: ExternalPoiEntry[], center: GeoPoint): PoiResult[] {
    const results: PoiResult[] = [];

    for (const entry of raw) {
      try {
        const coords = GeoPoint.create(entry.lat, entry.lon);
        const name = entry.name.trim() || entry.address.trim() || 'Local sem nome';

        results.push(
          PoiResult.create({
            osmId: entry.externalId,
            name,
            address: entry.address,
            lat: coords.lat,
            lon: coords.lon,
            distanceMeters: this.distanceCalculator.haversineMeters(center, coords),
          }),
        );
      } catch {
        continue;
      }
    }

    return results.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }
}
