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
exports.ReplyGuestMessageDto = exports.GuestMessageTurnDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class GuestMessageTurnDto {
}
exports.GuestMessageTurnDto = GuestMessageTurnDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['user', 'assistant'] }),
    (0, class_validator_1.IsIn)(['user', 'assistant']),
    __metadata("design:type", String)
], GuestMessageTurnDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(4000),
    __metadata("design:type", String)
], GuestMessageTurnDto.prototype, "content", void 0);
class ReplyGuestMessageDto {
}
exports.ReplyGuestMessageDto = ReplyGuestMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Quero encontrar uma farmácia perto de mim' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(4000),
    __metadata("design:type", String)
], ReplyGuestMessageDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'fazer-pix' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], ReplyGuestMessageDto.prototype, "topicSlug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ReplyGuestMessageDto.prototype, "currentStep", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [GuestMessageTurnDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GuestMessageTurnDto),
    __metadata("design:type", Array)
], ReplyGuestMessageDto.prototype, "messageHistory", void 0);
//# sourceMappingURL=reply-guest-message.dto.js.map