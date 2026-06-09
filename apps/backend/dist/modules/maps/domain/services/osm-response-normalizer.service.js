"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OsmResponseNormalizer = void 0;
const maps_entities_1 = require("../entities/maps.entities");
const geo_point_vo_1 = require("../value-objects/geo-point.vo");
class OsmResponseNormalizer {
    constructor(distanceCalculator) {
        this.distanceCalculator = distanceCalculator;
    }
    normalizePois(raw, center) {
        const results = [];
        for (const element of raw) {
            const coords = this.extractCoordinates(element);
            if (!coords)
                continue;
            const tags = element.tags ?? {};
            const address = this.buildAddress(tags);
            const name = tags.name?.trim() || address || 'Local sem nome';
            results.push(maps_entities_1.PoiResult.create({
                osmId: `${element.type}/${element.id}`,
                name,
                address,
                lat: coords.lat,
                lon: coords.lon,
                distanceMeters: this.distanceCalculator.haversineMeters(center, coords),
            }));
        }
        return results.sort((a, b) => a.distanceMeters - b.distanceMeters);
    }
    extractCoordinates(element) {
        try {
            if (element.type === 'node' && element.lat != null && element.lon != null) {
                return geo_point_vo_1.GeoPoint.create(element.lat, element.lon);
            }
            if (element.center) {
                return geo_point_vo_1.GeoPoint.create(element.center.lat, element.center.lon);
            }
            return null;
        }
        catch {
            return null;
        }
    }
    buildAddress(tags) {
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
exports.OsmResponseNormalizer = OsmResponseNormalizer;
//# sourceMappingURL=osm-response-normalizer.service.js.map