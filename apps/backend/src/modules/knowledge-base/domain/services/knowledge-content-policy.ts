import { ContentPolicyViolationError } from '../errors/domain.errors';
import { KnowledgeTopic } from '../entities/knowledge-topic.entity';

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

export class KnowledgeContentPolicy {
  validateTopic(topic: KnowledgeTopic): void {
    for (const step of topic.steps) {
      this.validateStepText(step.instruction, topic.slug);
      if (step.checkpointQuestion) {
        this.validateStepText(step.checkpointQuestion, topic.slug);
      }
    }
  }

  validateStepText(text: string, slug: string): void {
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(text)) {
        throw new ContentPolicyViolationError(
          `Conteúdo proibido no tópico "${slug}": não solicitar credenciais ou senhas.`,
        );
      }
    }
    if (slug === 'codigo-govbr') {
      for (const pattern of GOVBR_FORBIDDEN) {
        if (pattern.test(text)) {
          throw new ContentPolicyViolationError(
            'Conteúdo Gov.br deve ser apenas educativo, sem fluxo de login real.',
          );
        }
      }
    }
  }
}
