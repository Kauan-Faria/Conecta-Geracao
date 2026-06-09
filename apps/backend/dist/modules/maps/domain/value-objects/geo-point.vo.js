"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoPoint = void 0;
const domain_errors_1 = require("../errors/domain.errors");
class GeoPoint {
    constructor(lat, lon) {
        this.lat = lat;
        this.lon = lon;
    }
    static create(lat, lon) {
        if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
            throw new domain_errors_1.InvalidGeoPointError('Latitude deve estar entre -90 e 90');
        }
        if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
            throw new domain_errors_1.InvalidGeoPointError('Longitude deve estar entre -180 e 180');
        }
        return new GeoPoint(Math.round(lat * 1_000_000) / 1_000_000, Math.round(lon * 1_000_000) / 1_000_000);
    }
    equals(other) {
        return this.lat === other.lat && this.lon === other.lon;
    }
}
exports.GeoPoint = GeoPoint;
//# sourceMappingURL=geo-point.vo.js.map