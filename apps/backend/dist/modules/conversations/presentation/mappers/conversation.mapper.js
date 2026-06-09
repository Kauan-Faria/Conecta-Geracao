"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toConversationSummary = toConversationSummary;
exports.toMessageDto = toMessageDto;
exports.toConversationDetail = toConversationDetail;
function toConversationSummary(conversation) {
    return {
        id: conversation.id,
        topicSlug: conversation.topicSlug,
        status: conversation.status.value,
        currentStep: conversation.currentStep,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
    };
}
function toMessageDto(message) {
    const dto = {
        id: message.id,
        role: message.role.value,
        content: message.content.value,
        createdAt: message.createdAt.toISOString(),
    };
    if (message.metadata?.map_action) {
        dto.metadata = { map_action: message.metadata.map_action };
    }
    return dto;
}
function toConversationDetail(conversation) {
    return {
        ...toConversationSummary(conversation),
        messages: conversation.messages.map(toMessageDto),
    };
}
//# sourceMappingURL=conversation.mapper.js.map