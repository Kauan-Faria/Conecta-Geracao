"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCATION_INTENT_SYSTEM_APPENDIX = void 0;
exports.buildLocationReplyPrompt = buildLocationReplyPrompt;
exports.LOCATION_INTENT_SYSTEM_APPENDIX = `
REGRAS DE INTENÇÃO GEOGRÁFICA (mapas):
- Se o usuário busca um lugar físico próximo, responda em português simples confirmando a busca.
- Mencione o raio sugerido (2, 5 ou 10 km) de forma clara.
- Nunca peça endereço completo ou dados sensíveis.
- Para dúvidas não geográficas (PIX, WhatsApp, etc.), ignore estas regras.
- Você NÃO executa a busca — apenas orienta o usuário; o app abrirá o mapa.
`.trim();
function buildLocationReplyPrompt(params) {
    return `O usuário pediu: "${params.userMessage}"

Confirme em português simples que vai ajudá-lo a encontrar ${params.categoryLabel}.
${params.radiusExplanation}
Seja breve e acolhedor.`;
}
//# sourceMappingURL=location-intent.prompt.js.map