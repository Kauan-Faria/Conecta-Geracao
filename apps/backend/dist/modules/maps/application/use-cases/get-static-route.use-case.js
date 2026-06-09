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
exports.GetStaticRouteUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../shared/result");
const maps_entities_1 = require("../../domain/entities/maps.entities");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const geo_point_vo_1 = require("../../domain/value-objects/geo-point.vo");
const maps_gateways_1 = require("../ports/maps.gateways");
let GetStaticRouteUseCase = class GetStaticRouteUseCase {
    constructor(osrm) {
        this.osrm = osrm;
    }
    async execute(input) {
        try {
            const origin = geo_point_vo_1.GeoPoint.create(input.originLat, input.originLon);
            const destination = geo_point_vo_1.GeoPoint.create(input.destinationLat, input.destinationLon);
            if (origin.equals(destination)) {
                return (0, result_1.err)(new domain_errors_1.SameOriginDestinationError());
            }
            const route = await this.osrm.getRoute(origin, destination);
            if (!route) {
                return (0, result_1.err)(new domain_errors_1.RouteNotFoundError());
            }
            return (0, result_1.ok)(maps_entities_1.StaticRoute.create({
                origin,
                destination,
                route,
            }));
        }
        catch (error) {
            if (error instanceof domain_errors_1.DomainError)
                return (0, result_1.err)(error);
            throw error;
        }
    }
};
exports.GetStaticRouteUseCase = GetStaticRouteUseCase;
exports.GetStaticRouteUseCase = GetStaticRouteUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(maps_gateways_1.OSRM_GATEWAY)),
    __metadata("design:paramtypes", [Object])
], GetStaticRouteUseCase);
//# sourceMappingURL=get-static-route.use-case.js.map