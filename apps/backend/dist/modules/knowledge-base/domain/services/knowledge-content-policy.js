"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeContentPolicy = void 0;
const domain_errors_1 = require("../errors/domain.errors");
const FORBIDDEN_PATTERNS = [
    /\bsenha\b/i,
    /\bpin\b/i,
    /\botp\b/i,
    /\btoken\b/i,
    /\bcredencial/i,
    /\bdigite\s+sua\s+senha/i,
    /\bno\s+chat\b.*\bsenha/i,
];
const GOVBR_FORBIDDEN = [
    /\bfaça\s+login\b/i,
    /\bfaca\s+login\b/i,
    /\bautentique\b/i,
    /\bdigite\s+(sua\s+)?senha\b/i,
];
class KnowledgeContentPolicy {
    validateTopic(topic) {
        for (const step of topic.steps) {
            this.validateStepText(step.instruction, topic.slug);
            if (step.checkpointQuestion) {
                this.validateStepText(step.checkpointQuestion, topic.slug);
            }
        }
    }
    validateStepText(text, slug) {
        for (const pattern of FORBIDDEN_PATTERNS) {
            if (pattern.test(text)) {
                throw new domain_errors_1.ContentPolicyViolationError(`Conteúdo proibido no tópico "${slug}": não solicitar credenciais ou senhas.`);
            }
        }
        if (slug === 'codigo-govbr') {
            for (const pattern of GOVBR_FORBIDDEN) {
                if (pattern.test(text)) {
                    throw new domain_errors_1.ContentPolicyViolationError('Conteúdo Gov.br deve ser apenas educativo, sem fluxo de login real.');
                }
            }
        }
    }
}
exports.KnowledgeContentPolicy = KnowledgeContentPolicy;
//# sourceMappingURL=knowledge-content-policy.js.map