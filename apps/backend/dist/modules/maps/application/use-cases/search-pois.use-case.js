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
exports.SearchPoisUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../shared/result");
const maps_entities_1 = require("../../domain/entities/maps.entities");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const poi_category_mapper_service_1 = require("../../domain/services/poi-category-mapper.service");
const osm_response_normalizer_service_1 = require("../../domain/services/osm-response-normalizer.service");
const geo_point_vo_1 = require("../../domain/value-objects/geo-point.vo");
const poi_category_vo_1 = require("../../domain/value-objects/poi-category.vo");
const search_radius_vo_1 = require("../../domain/value-objects/search-radius.vo");
const maps_gateways_1 = require("../ports/maps.gateways");
const maps_config_1 = require("../../infrastructure/config/maps.config");
let SearchPoisUseCase = class SearchPoisUseCase {
    constructor(overpass, categoryMapper, normalizer, config) {
        this.overpass = overpass;
        this.categoryMapper = categoryMapper;
        this.normalizer = normalizer;
        this.config = config;
    }
    async execute(input) {
        try {
            const center = geo_point_vo_1.GeoPoint.create(input.lat, input.lon);
            const category = poi_category_vo_1.PoiCategory.create(input.category);
            const radius = search_radius_vo_1.SearchRadius.create(input.radiusKm, this.config.defaultRadiusKm, this.config.maxRadiusKm);
            const tagFilters = this.categoryMapper.toOverpassFilters(category);
            const raw = await this.overpass.searchAround(center, radius.toMeters(), tagFilters);
            const results = this.normalizer.normalizePois(raw, center);
            return (0, result_1.ok)(maps_entities_1.PoiSearchResult.create({
                center,
                radius,
                category,
                results,
            }));
        }
        catch (error) {
            if (error instanceof domain_errors_1.DomainError)
                return (0, result_1.err)(error);
            throw error;
        }
    }
};
exports.SearchPoisUseCase = SearchPoisUseCase;
exports.SearchPoisUseCase = SearchPoisUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(maps_gateways_1.OVERPASS_GATEWAY)),
    __param(3, (0, common_1.Inject)(maps_config_1.MAPS_CONFIG)),
    __metadata("design:paramtypes", [Object, poi_category_mapper_service_1.PoiCategoryMapper,
        osm_response_normalizer_service_1.OsmResponseNormalizer, Object])
], SearchPoisUseCase);
//# sourceMappingURL=search-pois.use-case.js.map