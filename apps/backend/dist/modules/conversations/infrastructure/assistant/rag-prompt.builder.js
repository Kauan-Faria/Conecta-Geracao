"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagPromptBuilder = void 0;
class RagPromptBuilder {
    buildSystemPrompt() {
        return [
            'Você é o assistente do app Conecta Geração, que ajuda pessoas com pouca familiaridade digital.',
            'Regras obrigatórias:',
            '- Use linguagem simples, uma instrução por mensagem, frases curtas.',
            '- Baseie-se APENAS no contexto da base de conhecimento fornecido; não invente passos.',
            '- NUNCA peça senha, PIN, OTP, token, código de verificação ou credencial bancária.',
            '- Se o usuário mencionar dados sensíveis, oriente a usar apenas o app/site oficial.',
            '- Ao ensinar um passo, inclua a pergunta de checkpoint quando existir no contexto.',
            '- Se o usuário disser que não conseguiu, repita ou simplifique o MESMO passo sem avançar.',
            '- Se o usuário confirmar (sim), avance para o próximo passo do contexto.',
            '- Se o tópico não estiver claro, sugira um dos tópicos listados em "Tópicos disponíveis".',
        ].join('\n');
    }
    buildUserPrompt(input) {
        const { knowledge, currentStep, checkpointDecision, userMessage, messageHistory } = input;
        const sections = [];
        if (knowledge.topicSlug) {
            sections.push(`## Tópico: ${knowledge.topicTitle} (${knowledge.topicSlug})`, knowledge.summary ?? '', '', '### Passos oficiais', ...knowledge.steps.map((s) => `${s.order}. ${s.instruction}` +
                (s.checkpointQuestion ? ` [Checkpoint: ${s.checkpointQuestion}]` : '')), '', `### Passo ativo (índice ${currentStep})`, this.describeActiveStep(knowledge, currentStep));
        }
        else {
            sections.push('## Tópico não identificado', 'Tópicos disponíveis:', ...knowledge.availableTopics.map((t) => `- ${t.slug}: ${t.title}`));
        }
        sections.push('', `### Decisão de checkpoint: ${checkpointDecision}`, '### Histórico recente', ...messageHistory.slice(-6).map((m) => `${m.role}: ${m.content}`), '', `### Mensagem atual do usuário`, userMessage);
        return sections.join('\n');
    }
    describeActiveStep(knowledge, currentStep) {
        if (knowledge.steps.length === 0) {
            return 'Nenhum passo carregado.';
        }
        const index = Math.min(Math.max(currentStep, 0), knowledge.steps.length - 1);
        const step = knowledge.steps[index];
        return `${step.order}. ${step.instruction}${step.checkpointQuestion ? ` — Pergunte: ${step.checkpointQuestion}` : ''}`;
    }
}
exports.RagPromptBuilder = RagPromptBuilder;
//# sourceMappingURL=rag-prompt.builder.js.map