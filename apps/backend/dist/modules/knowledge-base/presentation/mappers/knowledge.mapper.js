"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTopicSummary = toTopicSummary;
exports.toTopicDetail = toTopicDetail;
function toTopicSummary(topic) {
    return {
        slug: topic.slug,
        title: topic.title,
        summary: topic.summary,
        keywords: topic.keywords,
        displayOrder: topic.displayOrder,
    };
}
function toTopicDetail(topic) {
    return {
        ...toTopicSummary(topic),
        steps: topic.steps.map((step) => ({
            order: step.order,
            instruction: step.instruction,
            checkpointQuestion: step.checkpointQuestion ?? null,
            checkpointHints: step.checkpointHints,
        })),
    };
}
//# sourceMappingURL=knowledge.mapper.js.map