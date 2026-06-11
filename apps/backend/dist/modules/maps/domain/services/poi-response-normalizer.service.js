"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoiResponseNormalizer = void 0;
const maps_entities_1 = require("../entities/maps.entities");
const geo_point_vo_1 = require("../value-objects/geo-point.vo");
class PoiResponseNormalizer {
    constructor(distanceCalculator) {
        this.distanceCalculator = distanceCalculator;
    }
    normalizePois(raw, center) {
        const results = [];
        for (const entry of raw) {
            try {
                const coords = geo_point_vo_1.GeoPoint.create(entry.lat, entry.lon);
                const name = entry.name.trim() || entry.address.trim() || 'Local sem nome';
                results.push(maps_entities_1.PoiResult.create({
                    osmId: entry.externalId,
                    name,
                    address: entry.address,
                    lat: coords.lat,
                    lon: coords.lon,
                    distanceMeters: this.distanceCalculator.haversineMeters(center, coords),
                }));
            }
            catch {
                continue;
            }
        }
        return results.sort((a, b) => a.distanceMeters - b.distanceMeters);
    }
}
exports.PoiResponseNormalizer = PoiResponseNormalizer;
//# sourceMappingURL=poi-response-normalizer.service.js.map