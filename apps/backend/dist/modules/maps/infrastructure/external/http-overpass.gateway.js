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
exports.HttpOverpassGateway = void 0;
const common_1 = require("@nestjs/common");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const maps_config_1 = require("../config/maps.config");
const maps_http_client_1 = require("./maps-http.client");
let HttpOverpassGateway = class HttpOverpassGateway {
    constructor(http, config) {
        this.http = http;
        this.config = config;
    }
    async searchAround(center, radiusMeters, tagFilters) {
        const timeoutSeconds = Math.max(1, Math.floor(this.config.httpTimeoutMs / 1000));
        const query = (0, maps_http_client_1.buildOverpassQuery)(center.lat, center.lon, radiusMeters, tagFilters, timeoutSeconds);
        let response;
        try {
            response = await this.http.request(this.config.overpassBaseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `data=${encodeURIComponent(query)}`,
            });
        }
        catch (error) {
            if (error instanceof domain_errors_1.ProviderTimeoutError) {
                throw new domain_errors_1.OverpassTimeoutError();
            }
            throw error;
        }
        if (response.status === 504 || response.status === 429) {
            throw new domain_errors_1.OverpassTimeoutError();
        }
        this.http.assertOk(response, 'Overpass');
        const payload = (await response.json());
        return payload.elements ?? [];
    }
};
exports.HttpOverpassGateway = HttpOverpassGateway;
exports.HttpOverpassGateway = HttpOverpassGateway = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(maps_config_1.MAPS_CONFIG)),
    __metadata("design:paramtypes", [maps_http_client_1.MapsHttpClient, Object])
], HttpOverpassGateway);
//# sourceMappingURL=http-overpass.gateway.js.map