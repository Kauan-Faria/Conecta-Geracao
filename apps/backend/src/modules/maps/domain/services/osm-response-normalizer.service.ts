import { PoiResult } from '../entities/maps.entities';
import { GeoPoint } from '../value-objects/geo-point.vo';
import { GeoDistanceCalculator } from './geo-distance-calculator.service';

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export class OsmResponseNormalizer {
  constructor(private readonly distanceCalculator: GeoDistanceCalculator) {}

  normalizePois(raw: OverpassElement[], center: GeoPoint): PoiResult[] {
    const results: PoiResult[] = [];

    for (const element of raw) {
      const coords = this.extractCoordinates(element);
      if (!coords) continue;

      const tags = element.tags ?? {};
      const address = this.buildAddress(tags);
      const name = tags.name?.trim() || address || 'Local sem nome';

      results.push(
        PoiResult.create({
          osmId: `${element.type}/${element.id}`,
          name,
          address,
          lat: coords.lat,
          lon: coords.lon,
          distanceMeters: this.distanceCalculator.haversineMeters(center, coords),
        }),
      );
    }

    return results.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  private extractCoordinates(element: OverpassElement): GeoPoint | null {
    try {
      if (element.type === 'node' && element.lat != null && element.lon != null) {
        return GeoPoint.create(element.lat, element.lon);
      }
      if (element.center) {
        return GeoPoint.create(element.center.lat, element.center.lon);
      }
      return null;
    } catch {
      return null;
    }
  }

  private buildAddress(tags: Record<string, string>): string {
    const street = tags['addr:street'];
    const number = tags['addr:housenumber'];
    const city = tags['addr:city'] ?? tags['addr:town'] ?? tags['addr:village'];

    const parts = [
      street ? (number ? `${street}, ${number}` : street) : undefined,
      city,
    ].filter(Boolean);

    return parts.join(' - ');
  }
}
