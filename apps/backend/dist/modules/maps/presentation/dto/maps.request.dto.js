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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRouteRequestDto = exports.GeocodePlaceRequestDto = exports.SearchPoisRequestDto = exports.GeoPointDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const poi_category_vo_1 = require("../../domain/value-objects/poi-category.vo");
class GeoPointDto {
}
exports.GeoPointDto = GeoPointDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: -22.9056 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], GeoPointDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -47.0608 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], GeoPointDto.prototype, "lon", void 0);
class SearchPoisRequestDto {
}
exports.SearchPoisRequestDto = SearchPoisRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: -22.9056 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], SearchPoisRequestDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -47.0608 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], SearchPoisRequestDto.prototype, "lon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: poi_category_vo_1.POI_CATEGORIES, example: 'pharmacy' }),
    (0, class_validator_1.IsEnum)(poi_category_vo_1.POI_CATEGORIES),
    __metadata("design:type", Object)
], SearchPoisRequestDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: [2, 5, 10], example: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsIn)([2, 5, 10]),
    __metadata("design:type", Number)
], SearchPoisRequestDto.prototype, "radiusKm", void 0);
class GeocodePlaceRequestDto {
}
exports.GeocodePlaceRequestDto = GeocodePlaceRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Centro, Campinas' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], GeocodePlaceRequestDto.prototype, "query", void 0);
class GetRouteRequestDto {
}
exports.GetRouteRequestDto = GetRouteRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: GeoPointDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GeoPointDto),
    __metadata("design:type", GeoPointDto)
], GetRouteRequestDto.prototype, "origin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: GeoPointDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GeoPointDto),
    __metadata("design:type", GeoPointDto)
], GetRouteRequestDto.prototype, "destination", void 0);
//# sourceMappingURL=maps.request.dto.js.map