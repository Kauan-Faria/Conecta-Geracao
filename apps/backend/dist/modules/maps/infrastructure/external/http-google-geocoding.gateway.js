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
exports.HttpGoogleGeocodingGateway = void 0;
const common_1 = require("@nestjs/common");
const maps_entities_1 = require("../../domain/entities/maps.entities");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const geo_point_vo_1 = require("../../domain/value-objects/geo-point.vo");
const in_memory_geocode_cache_1 = require("../cache/in-memory-geocode.cache");
const maps_config_1 = require("../config/maps.config");
const maps_http_client_1 = require("./maps-http.client");
const GOOGLE_GEOCODING_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
let HttpGoogleGeocodingGateway = class HttpGoogleGeocodingGateway {
    constructor(http, cache, config) {
        this.http = http;
        this.cache = cache;
        this.config = config;
    }
    async geocode(query) {
        const cacheKey = `forward:${query.value.toLowerCase()}`;
        const cached = this.cache.getForward(cacheKey, this.config.geocodeCacheTtlMs);
        if (cached)
            return cached;
        const url = this.buildUrl({
            address: query.value,
        });
        const result = await this.fetchGeocode(url);
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
        const url = this.buildUrl({
            latlng: `${point.lat},${point.lon}`,
        });
        const result = await this.fetchGeocode(url);
        if (result) {
            this.cache.setReverse(cacheKey, result, this.config.geocodeCacheTtlMs);
        }
        return result;
    }
    buildUrl(params) {
        const url = new URL(GOOGLE_GEOCODING_BASE_URL);
        url.searchParams.set('key', this.config.googleMapsApiKey);
        url.searchParams.set('language', 'pt-BR');
        url.searchParams.set('region', 'br');
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }
        if ('address' in params) {
            url.searchParams.set('components', 'country:BR');
        }
        return url.toString();
    }
    async fetchGeocode(url) {
        let response;
        try {
            response = await this.http.request(url);
        }
        catch (error) {
            if (error instanceof domain_errors_1.ProviderTimeoutError) {
                throw error;
            }
            throw new domain_errors_1.ExternalServiceUnavailableError('Google Maps');
        }
        this.http.assertOk(response, 'Google Maps');
        const payload = (await response.json());
        if (payload.status === 'ZERO_RESULTS') {
            return null;
        }
        if (payload.status !== 'OK') {
            throw new domain_errors_1.ExternalServiceUnavailableError('Google Maps');
        }
        const item = payload.results?.[0];
        if (!item?.geometry?.location) {
            return null;
        }
        return maps_entities_1.GeocodeResult.create({
            point: geo_point_vo_1.GeoPoint.create(item.geometry.location.lat, item.geometry.location.lng),
            displayName: item.formatted_address,
        });
    }
};
exports.HttpGoogleGeocodingGateway = HttpGoogleGeocodingGateway;
exports.HttpGoogleGeocodingGateway = HttpGoogleGeocodingGateway = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(maps_config_1.MAPS_CONFIG)),
    __metadata("design:paramtypes", [maps_http_client_1.MapsHttpClient,
        in_memory_geocode_cache_1.InMemoryGeocodeCache, Object])
], HttpGoogleGeocodingGateway);
//# sourceMappingURL=http-google-geocoding.gateway.js.map