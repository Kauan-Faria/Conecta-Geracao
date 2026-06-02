"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicInferencePolicy = void 0;
class TopicInferencePolicy {
    inferSlug(userMessage, topics) {
        const normalized = userMessage
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{M}/gu, '');
        let bestSlug = null;
        let bestScore = 0;
        for (const topic of topics) {
            let score = 0;
            if (normalized.includes(topic.slug.replace(/-/g, ' ')) || normalized.includes(topic.slug)) {
                score += 3;
            }
            for (const keyword of topic.keywords) {
                const kw = keyword
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/\p{M}/gu, '');
                if (kw.length >= 3 && normalized.includes(kw)) {
                    score += 1;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestSlug = topic.slug;
            }
        }
        return bestScore > 0 ? bestSlug : null;
    }
}
exports.TopicInferencePolicy = TopicInferencePolicy;
//# sourceMappingURL=topic-inference.policy.js.map