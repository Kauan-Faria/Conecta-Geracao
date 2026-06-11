"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCampaignResponseDto = toCampaignResponseDto;
function toCampaignResponseDto(campaign, idempotentReplay = false) {
    return {
        id: campaign.id,
        status: campaign.status,
        requestedAt: campaign.requestedAt.toISOString(),
        completedAt: campaign.completedAt?.toISOString() ?? null,
        sentCount: campaign.sentCount,
        skippedCount: campaign.skippedCount,
        ...(idempotentReplay ? { idempotentReplay: true } : {}),
    };
}
//# sourceMappingURL=campaigns.mapper.js.map