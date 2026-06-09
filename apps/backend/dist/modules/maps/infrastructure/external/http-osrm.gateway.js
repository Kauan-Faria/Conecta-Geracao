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
exports.HttpOsrmGateway = void 0;
const common_1 = require("@nestjs/common");
const maps_entities_1 = require("../../domain/entities/maps.entities");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const maps_config_1 = require("../config/maps.config");
const maps_http_client_1 = require("./maps-http.client");
let HttpOsrmGateway = class HttpOsrmGateway {
    constructor(http, config) {
        this.http = http;
        this.config = config;
    }
    async getRoute(origin, destination) {
        const path = `/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
        const url = new URL(path, this.config.osrmBaseUrl);
        url.searchParams.set('overview', 'full');
        url.searchParams.set('geometries', 'polyline');
        url.searchParams.set('steps', 'false');
        let response;
        try {
            response = await this.http.request(url.toString());
        }
        catch (error) {
            if (error instanceof domain_errors_1.ProviderTimeoutError) {
                throw error;
            }
            throw new domain_errors_1.ExternalServiceUnavailableError('OSRM');
        }
        if (response.status === 404) {
            return null;
        }
        this.http.assertOk(response, 'OSRM');
        const payload = (await response.json());
        const route = payload.routes?.[0];
        if (!route?.geometry || route.distance == null || route.duration == null) {
            return null;
        }
        return maps_entities_1.RouteResult.create({
            polyline: route.geometry,
            distanceMeters: Math.round(route.distance),
            durationSeconds: Math.round(route.duration),
        });
    }
};
exports.HttpOsrmGateway = HttpOsrmGateway;
exports.HttpOsrmGateway = HttpOsrmGateway = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(maps_config_1.MAPS_CONFIG)),
    __metadata("design:paramtypes", [maps_http_client_1.MapsHttpClient, Object])
], HttpOsrmGateway);
//# sourceMappingURL=http-osrm.gateway.js.map