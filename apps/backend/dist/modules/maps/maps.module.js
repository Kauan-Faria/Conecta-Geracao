"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapsModule = void 0;
const common_1 = require("@nestjs/common");
const search_pois_use_case_1 = require("./application/use-cases/search-pois.use-case");
const geocode_place_use_case_1 = require("./application/use-cases/geocode-place.use-case");
const get_static_route_use_case_1 = require("./application/use-cases/get-static-route.use-case");
const maps_gateways_1 = require("./application/ports/maps.gateways");
const poi_category_mapper_service_1 = require("./domain/services/poi-category-mapper.service");
const geo_distance_calculator_service_1 = require("./domain/services/geo-distance-calculator.service");
const poi_response_normalizer_service_1 = require("./domain/services/poi-response-normalizer.service");
const in_memory_geocode_cache_1 = require("./infrastructure/cache/in-memory-geocode.cache");
const maps_config_1 = require("./infrastructure/config/maps.config");
const http_google_geocoding_gateway_1 = require("./infrastructure/external/http-google-geocoding.gateway");
const http_google_places_gateway_1 = require("./infrastructure/external/http-google-places.gateway");
const http_google_directions_gateway_1 = require("./infrastructure/external/http-google-directions.gateway");
const maps_http_client_1 = require("./infrastructure/external/maps-http.client");
const maps_controller_1 = require("./presentation/maps.controller");
let MapsModule = class MapsModule {
};
exports.MapsModule = MapsModule;
exports.MapsModule = MapsModule = __decorate([
    (0, common_1.Module)({
        controllers: [maps_controller_1.MapsController],
        providers: [
            {
                provide: maps_config_1.MAPS_CONFIG,
                useFactory: maps_config_1.createMapsConfigFromEnv,
            },
            maps_http_client_1.MapsHttpClient,
            in_memory_geocode_cache_1.InMemoryGeocodeCache,
            poi_category_mapper_service_1.PoiCategoryMapper,
            geo_distance_calculator_service_1.GeoDistanceCalculator,
            poi_response_normalizer_service_1.PoiResponseNormalizer,
            {
                provide: maps_gateways_1.POI_SEARCH_GATEWAY,
                useClass: http_google_places_gateway_1.HttpGooglePlacesGateway,
            },
            {
                provide: maps_gateways_1.GEOCODING_GATEWAY,
                useClass: http_google_geocoding_gateway_1.HttpGoogleGeocodingGateway,
            },
            {
                provide: maps_gateways_1.ROUTE_GATEWAY,
                useClass: http_google_directions_gateway_1.HttpGoogleDirectionsGateway,
            },
            search_pois_use_case_1.SearchPoisUseCase,
            geocode_place_use_case_1.GeocodePlaceUseCase,
            get_static_route_use_case_1.GetStaticRouteUseCase,
        ],
        exports: [search_pois_use_case_1.SearchPoisUseCase, geocode_place_use_case_1.GeocodePlaceUseCase, get_static_route_use_case_1.GetStaticRouteUseCase],
    })
], MapsModule);
//# sourceMappingURL=maps.module.js.map