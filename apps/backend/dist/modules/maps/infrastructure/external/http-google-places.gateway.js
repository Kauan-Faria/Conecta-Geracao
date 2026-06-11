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
exports.HttpGooglePlacesGateway = void 0;
const common_1 = require("@nestjs/common");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const maps_config_1 = require("../config/maps.config");
const maps_http_client_1 = require("./maps-http.client");
const GOOGLE_PLACES_SEARCH_NEARBY_URL = 'https://places.googleapis.com/v1/places:searchNearby';
const PLACES_FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.location';
let HttpGooglePlacesGateway = class HttpGooglePlacesGateway {
    constructor(http, config) {
        this.http = http;
        this.config = config;
    }
    async searchAround(center, radiusMeters, placeType) {
        let response;
        try {
            response = await this.http.request(GOOGLE_PLACES_SEARCH_NEARBY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.config.googleMapsApiKey,
                    'X-Goog-FieldMask': PLACES_FIELD_MASK,
                },
                body: JSON.stringify({
                    languageCode: 'pt-BR',
                    regionCode: 'BR',
                    includedTypes: [placeType],
                    maxResultCount: 20,
                    locationRestriction: {
                        circle: {
                            center: { latitude: center.lat, longitude: center.lon },
                            radius: radiusMeters,
                        },
                    },
                }),
            });
        }
        catch (error) {
            if (error instanceof domain_errors_1.ProviderTimeoutError) {
                throw new domain_errors_1.MapsSearchTimeoutError();
            }
            throw error;
        }
        if (response.status === 504 || response.status === 429) {
            throw new domain_errors_1.MapsSearchTimeoutError();
        }
        if (!response.ok) {
            throw new domain_errors_1.ExternalServiceUnavailableError('Google Places');
        }
        const payload = (await response.json());
        return (payload.places ?? [])
            .map((item) => this.toExternalPoiEntry(item))
            .filter((entry) => entry != null);
    }
    toExternalPoiEntry(item) {
        const lat = item.location?.latitude;
        const lon = item.location?.longitude;
        if (lat == null || lon == null || !item.id) {
            return null;
        }
        const externalId = item.id.startsWith('places/') ? item.id.slice('places/'.length) : item.id;
        return {
            externalId,
            name: item.displayName?.text ?? '',
            address: item.formattedAddress ?? '',
            lat,
            lon,
        };
    }
};
exports.HttpGooglePlacesGateway = HttpGooglePlacesGateway;
exports.HttpGooglePlacesGateway = HttpGooglePlacesGateway = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(maps_config_1.MAPS_CONFIG)),
    __metadata("design:paramtypes", [maps_http_client_1.MapsHttpClient, Object])
], HttpGooglePlacesGateway);
//# sourceMappingURL=http-google-places.gateway.js.map