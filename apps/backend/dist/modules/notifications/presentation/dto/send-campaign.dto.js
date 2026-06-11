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
exports.SendCampaignDto = exports.CampaignSegmentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CampaignSegmentDto {
}
exports.CampaignSegmentDto = CampaignSegmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['all_active', 'uid_list'], example: 'all_active' }),
    (0, class_validator_1.IsEnum)(['all_active', 'uid_list']),
    __metadata("design:type", String)
], CampaignSegmentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['firebase-uid-1'] }),
    (0, class_validator_1.ValidateIf)((o) => o.type === 'uid_list'),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MinLength)(1, { each: true }),
    __metadata("design:type", Array)
], CampaignSegmentDto.prototype, "firebaseUids", void 0);
class SendCampaignDto {
}
exports.SendCampaignDto = SendCampaignDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Novidade no Conecta Geração' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], SendCampaignDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Confira dicas para usar o app com mais segurança.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], SendCampaignDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '/' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendCampaignDto.prototype, "deepLink", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: CampaignSegmentDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CampaignSegmentDto),
    __metadata("design:type", CampaignSegmentDto)
], SendCampaignDto.prototype, "segment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'campaign-2026-06-09-lancamento' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendCampaignDto.prototype, "idempotencyKey", void 0);
//# sourceMappingURL=send-campaign.dto.js.map