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
exports.CreateConversationUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../shared/result");
const conversation_entity_1 = require("../../domain/entities/conversation.entity");
const domain_errors_1 = require("../../domain/errors/domain.errors");
const conversation_status_vo_1 = require("../../domain/value-objects/conversation-status.vo");
const topic_slug_ref_vo_1 = require("../../domain/value-objects/topic-slug-ref.vo");
const conversation_repository_1 = require("../ports/conversation.repository");
let CreateConversationUseCase = class CreateConversationUseCase {
    constructor(conversations) {
        this.conversations = conversations;
    }
    async execute(firebaseUid, topicSlug) {
        try {
            const slugRef = topic_slug_ref_vo_1.TopicSlugRef.createOptional(topicSlug);
            const conversation = conversation_entity_1.Conversation.create({
                firebaseUid,
                topicSlug: slugRef?.value ?? null,
                status: conversation_status_vo_1.ConversationStatus.inProgress(),
                currentStep: 0,
            });
            const saved = await this.conversations.create(conversation);
            return (0, result_1.ok)(saved);
        }
        catch (error) {
            if (error instanceof domain_errors_1.DomainError) {
                return (0, result_1.err)(error);
            }
            throw error;
        }
    }
};
exports.CreateConversationUseCase = CreateConversationUseCase;
exports.CreateConversationUseCase = CreateConversationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(conversation_repository_1.CONVERSATION_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], CreateConversationUseCase);
//# sourceMappingURL=create-conversation.use-case.js.map