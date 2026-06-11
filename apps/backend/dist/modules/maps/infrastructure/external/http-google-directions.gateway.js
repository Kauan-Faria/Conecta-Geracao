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
exports.HttpGoogleDirectionsGateway = void 0;
const common_1 = require("@nestjs/common");
const maps_entities_1 = require("../../domain/entities/maps.entities");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const maps_config_1 = require("../config/maps.config");
const maps_http_client_1 = require("./maps-http.client");
const GOOGLE_ROUTES_COMPUTE_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const ROUTES_FIELD_MASK = 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline';
let HttpGoogleDirectionsGateway = class HttpGoogleDirectionsGateway {
    constructor(http, config) {
        this.http = http;
        this.config = config;
    }
    async getRoute(origin, destination) {
        let response;
        try {
            response = await this.http.request(GOOGLE_ROUTES_COMPUTE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.config.googleMapsApiKey,
                    'X-Goog-FieldMask': ROUTES_FIELD_MASK,
                },
                body: JSON.stringify({
                    origin: {
                        location: { latLng: { latitude: origin.lat, longitude: origin.lon } },
                    },
                    destination: {
                        location: {
                            latLng: { latitude: destination.lat, longitude: destination.lon },
                        },
                    },
                    travelMode: 'DRIVE',
                    languageCode: 'pt-BR',
                    units: 'METRIC',
                }),
            });
        }
        catch (error) {
            if (error instanceof domain_errors_1.ProviderTimeoutError) {
                throw error;
            }
            throw new domain_errors_1.ExternalServiceUnavailableError('Google Routes');
        }
        if (response.status === 404) {
            return null;
        }
        if (!response.ok) {
            throw new domain_errors_1.ExternalServiceUnavailableError('Google Routes');
        }
        const payload = (await response.json());
        const route = payload.routes?.[0];
        const polyline = route?.polyline?.encodedPolyline;
        if (!polyline || route.distanceMeters == null || !route.duration) {
            return null;
        }
        const durationSeconds = this.parseDurationSeconds(route.duration);
        if (durationSeconds == null) {
            return null;
        }
        return maps_entities_1.RouteResult.create({
            polyline,
            distanceMeters: route.distanceMeters,
            durationSeconds,
        });
    }
    parseDurationSeconds(duration) {
        const match = /^(\d+)s$/.exec(duration.trim());
        if (!match)
            return null;
        return Number.parseInt(match[1], 10);
    }
};
exports.HttpGoogleDirectionsGateway = HttpGoogleDirectionsGateway;
exports.HttpGoogleDirectionsGateway = HttpGoogleDirectionsGateway = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(maps_config_1.MAPS_CONFIG)),
    __metadata("design:paramtypes", [maps_http_client_1.MapsHttpClient, Object])
], HttpGoogleDirectionsGateway);
//# sourceMappingURL=http-google-directions.gateway.js.map