"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoDistanceCalculator = void 0;
const EARTH_RADIUS_METERS = 6_371_000;
class GeoDistanceCalculator {
    haversineMeters(from, to) {
        const lat1 = this.toRadians(from.lat);
        const lat2 = this.toRadians(to.lat);
        const deltaLat = this.toRadians(to.lat - from.lat);
        const deltaLon = this.toRadians(to.lon - from.lon);
        const a = Math.sin(deltaLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(EARTH_RADIUS_METERS * c);
    }
    toRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }
}
exports.GeoDistanceCalculator = GeoDistanceCalculator;
//# sourceMappingURL=geo-distance-calculator.service.js.map