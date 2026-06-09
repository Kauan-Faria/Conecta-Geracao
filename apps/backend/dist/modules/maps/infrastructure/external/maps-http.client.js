"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapsHttpClient = void 0;
exports.buildOverpassQuery = buildOverpassQuery;
const common_1 = require("@nestjs/common");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const maps_config_1 = require("../config/maps.config");
let MapsHttpClient = class MapsHttpClient {
    constructor(config) {
        this.config = config;
    }
    async request(url, init = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.httpTimeoutMs);
        try {
            const response = await fetch(url, {
                ...init,
                signal: controller.signal,
                headers: {
                    'User-Agent': this.config.userAgent,
                    Accept: 'application/json',
                    ...init.headers,
                },
            });
            return response;
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new domain_errors_1.ProviderTimeoutError(this.serviceFromUrl(url));
            }
            throw new domain_errors_1.ExternalServiceUnavailableError(this.serviceFromUrl(url));
        }
        finally {
            clearTimeout(timeout);
        }
    }
    assertOk(response, service) {
        if (response.status >= 500) {
            throw new domain_errors_1.ExternalServiceUnavailableError(service);
        }
    }
    serviceFromUrl(url) {
        if (url.includes('overpass'))
            return 'Overpass';
        if (url.includes('nominatim') || url.includes('openstreetmap.org'))
            return 'Nominatim';
        if (url.includes('osrm') || url.includes('router.project-osrm'))
            return 'OSRM';
        return 'maps';
    }
};
exports.MapsHttpClient = MapsHttpClient;
exports.MapsHttpClient = MapsHttpClient = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(maps_config_1.MAPS_CONFIG)),
    __metadata("design:paramtypes", [Object])
], MapsHttpClient);
function buildOverpassQuery(lat, lon, radiusMeters, tagFilters, timeoutSeconds) {
    const conditions = tagFilters
        .flatMap((tags) => {
        const tagString = Object.entries(tags)
            .map(([key, value]) => `["${key}"="${value}"]`)
            .join('');
        return [
            `  node${tagString}(around:${radiusMeters},${lat},${lon});`,
            `  way${tagString}(around:${radiusMeters},${lat},${lon});`,
        ];
    })
        .join('\n');
    return `[out:json][timeout:${timeoutSeconds}];\n(\n${conditions}\n);\nout center tags;`;
}
//# sourceMappingURL=maps-http.client.js.map