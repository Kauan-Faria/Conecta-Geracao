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
exports.HttpNominatimGateway = void 0;
const common_1 = require("@nestjs/common");
const maps_entities_1 = require("../../domain/entities/maps.entities");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const geo_point_vo_1 = require("../../domain/value-objects/geo-point.vo");
const in_memory_geocode_cache_1 = require("../cache/in-memory-geocode.cache");
const maps_config_1 = require("../config/maps.config");
const maps_http_client_1 = require("./maps-http.client");
let HttpNominatimGateway = class HttpNominatimGateway {
    constructor(http, cache, config) {
        this.http = http;
        this.cache = cache;
        this.config = config;
        this.lastRequestAt = 0;
    }
    async geocode(query) {
        const cacheKey = `forward:${query.value.toLowerCase()}`;
        const cached = this.cache.getForward(cacheKey, this.config.geocodeCacheTtlMs);
        if (cached)
            return cached;
        const url = new URL('/search', this.config.nominatimBaseUrl);
        url.searchParams.set('q', query.value);
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', '1');
        url.searchParams.set('addressdetails', '1');
        const result = await this.fetchGeocode(url.toString());
        if (result) {
            this.cache.setForward(cacheKey, result, this.config.geocodeCacheTtlMs);
        }
        return result;
    }
    async reverseGeocode(point) {
        const cacheKey = `reverse:${point.lat}:${point.lon}`;
        const cached = this.cache.getReverse(cacheKey, this.config.geocodeCacheTtlMs);
        if (cached)
            return cached;
        const url = new URL('/reverse', this.config.nominatimBaseUrl);
        url.searchParams.set('lat', String(point.lat));
        url.searchParams.set('lon', String(point.lon));
        url.searchParams.set('format', 'json');
        url.searchParams.set('addressdetails', '1');
        const result = await this.fetchGeocode(url.toString());
        if (result) {
            this.cache.setReverse(cacheKey, result, this.config.geocodeCacheTtlMs);
        }
        return result;
    }
    async fetchGeocode(url) {
        await this.waitForThrottle();
        let response;
        try {
            response = await this.http.request(url, {
                headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
            });
        }
        catch (error) {
            if (error instanceof domain_errors_1.ProviderTimeoutError) {
                throw error;
            }
            throw new domain_errors_1.ExternalServiceUnavailableError('Nominatim');
        }
        if (response.status === 404) {
            return null;
        }
        this.http.assertOk(response, 'Nominatim');
        const payload = (await response.json());
        const item = Array.isArray(payload) ? payload[0] : payload;
        if (!item?.lat || !item?.lon) {
            return null;
        }
        return maps_entities_1.GeocodeResult.create({
            point: geo_point_vo_1.GeoPoint.create(Number.parseFloat(item.lat), Number.parseFloat(item.lon)),
            displayName: item.display_name,
        });
    }
    async waitForThrottle() {
        const elapsed = Date.now() - this.lastRequestAt;
        const waitMs = this.config.nominatimMinIntervalMs - elapsed;
        if (waitMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
        this.lastRequestAt = Date.now();
    }
};
exports.HttpNominatimGateway = HttpNominatimGateway;
exports.HttpNominatimGateway = HttpNominatimGateway = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(maps_config_1.MAPS_CONFIG)),
    __metadata("design:paramtypes", [maps_http_client_1.MapsHttpClient,
        in_memory_geocode_cache_1.InMemoryGeocodeCache, Object])
], HttpNominatimGateway);
//# sourceMappingURL=http-nominatim.gateway.js.map