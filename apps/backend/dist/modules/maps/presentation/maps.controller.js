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
exports.MapsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const search_pois_use_case_1 = require("../application/use-cases/search-pois.use-case");
const geocode_place_use_case_1 = require("../application/use-cases/geocode-place.use-case");
const get_static_route_use_case_1 = require("../application/use-cases/get-static-route.use-case");
const maps_request_dto_1 = require("./dto/maps.request.dto");
const maps_mapper_1 = require("./mappers/maps.mapper");
let MapsController = class MapsController {
    constructor(searchPois, geocodePlace, getStaticRoute) {
        this.searchPois = searchPois;
        this.geocodePlace = geocodePlace;
        this.getStaticRoute = getStaticRoute;
    }
    async search(body) {
        const result = await this.searchPois.execute(body);
        if (!result.ok)
            throw this.mapDomainError(result.error);
        return (0, maps_mapper_1.toPoiSearchResponse)(result.value);
    }
    async geocode(body) {
        const result = await this.geocodePlace.execute(body.query);
        if (!result.ok)
            throw this.mapDomainError(result.error);
        return (0, maps_mapper_1.toGeocodeResponse)(result.value);
    }
    async route(body) {
        const result = await this.getStaticRoute.execute({
            originLat: body.origin.lat,
            originLon: body.origin.lon,
            destinationLat: body.destination.lat,
            destinationLon: body.destination.lon,
        });
        if (!result.ok)
            throw this.mapDomainError(result.error);
        return (0, maps_mapper_1.toRouteResponse)(result.value);
    }
    mapDomainError(error) {
        switch (error.code) {
            case 'PLACE_NOT_FOUND':
                throw new common_1.NotFoundException({
                    error: { code: 'NOT_FOUND', message: error.message },
                });
            case 'ROUTE_NOT_FOUND':
            case 'SAME_ORIGIN_DESTINATION':
                throw new common_1.UnprocessableEntityException({
                    error: { code: 'UNPROCESSABLE_ENTITY', message: error.message },
                });
            case 'EXTERNAL_SERVICE_UNAVAILABLE':
                throw new common_1.ServiceUnavailableException({
                    error: { code: 'SERVICE_UNAVAILABLE', message: error.message },
                });
            case 'MAPS_SEARCH_TIMEOUT':
            case 'PROVIDER_TIMEOUT':
                throw new common_1.GatewayTimeoutException({
                    error: { code: 'GATEWAY_TIMEOUT', message: error.message },
                });
            case 'INVALID_GEO_POINT':
            case 'INVALID_POI_CATEGORY':
            case 'INVALID_SEARCH_RADIUS':
            case 'INVALID_PLACE_QUERY':
                throw new common_1.BadRequestException({
                    error: { code: 'VALIDATION_ERROR', message: error.message },
                });
            default:
                throw new common_1.BadRequestException({
                    error: { code: 'VALIDATION_ERROR', message: error.message },
                });
        }
    }
};
exports.MapsController = MapsController;
__decorate([
    (0, common_1.Post)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar POIs por categoria e raio' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [maps_request_dto_1.SearchPoisRequestDto]),
    __metadata("design:returntype", Promise)
], MapsController.prototype, "search", null);
__decorate([
    (0, common_1.Post)('geocode'),
    (0, swagger_1.ApiOperation)({ summary: 'Geocodificar texto em coordenadas' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [maps_request_dto_1.GeocodePlaceRequestDto]),
    __metadata("design:returntype", Promise)
], MapsController.prototype, "geocode", null);
__decorate([
    (0, common_1.Post)('route'),
    (0, swagger_1.ApiOperation)({ summary: 'Calcular rota estática entre dois pontos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [maps_request_dto_1.GetRouteRequestDto]),
    __metadata("design:returntype", Promise)
], MapsController.prototype, "route", null);
exports.MapsController = MapsController = __decorate([
    (0, swagger_1.ApiTags)('maps'),
    (0, common_1.Controller)('maps'),
    __metadata("design:paramtypes", [search_pois_use_case_1.SearchPoisUseCase,
        geocode_place_use_case_1.GeocodePlaceUseCase,
        get_static_route_use_case_1.GetStaticRouteUseCase])
], MapsController);
//# sourceMappingURL=maps.controller.js.map