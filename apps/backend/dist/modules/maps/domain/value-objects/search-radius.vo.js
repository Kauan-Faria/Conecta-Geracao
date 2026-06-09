"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchRadius = void 0;
const domain_errors_1 = require("../errors/domain.errors");
const ALLOWED_RADIUS_KM = [2, 5, 10];
class SearchRadius {
    constructor(kilometers) {
        this.kilometers = kilometers;
    }
    static create(raw, defaultKm, maxKm) {
        const km = raw ?? defaultKm;
        if (!Number.isFinite(km)) {
            throw new domain_errors_1.InvalidSearchRadiusError();
        }
        if (km > maxKm) {
            throw new domain_errors_1.InvalidSearchRadiusError(`Raio máximo permitido é ${maxKm} km`);
        }
        if (!ALLOWED_RADIUS_KM.includes(km)) {
            throw new domain_errors_1.InvalidSearchRadiusError('Raio deve ser 2, 5 ou 10 km');
        }
        return new SearchRadius(km);
    }
    toMeters() {
        return this.kilometers * 1000;
    }
}
exports.SearchRadius = SearchRadius;
//# sourceMappingURL=search-radius.vo.js.map