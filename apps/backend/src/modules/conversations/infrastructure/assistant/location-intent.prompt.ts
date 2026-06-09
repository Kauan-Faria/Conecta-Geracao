export const LOCATION_INTENT_SYSTEM_APPENDIX = `
REGRAS DE INTENÇÃO GEOGRÁFICA (mapas):
- Se o usuário busca um lugar físico próximo, responda em português simples confirmando a busca.
- Mencione o raio sugerido (2, 5 ou 10 km) de forma clara.
- Nunca peça endereço completo ou dados sensíveis.
- Para dúvidas não geográficas (PIX, WhatsApp, etc.), ignore estas regras.
- Você NÃO executa a busca — apenas orienta o usuário; o app abrirá o mapa.
`.trim();

export function buildLocationReplyPrompt(params: {
  categoryLabel: string;
  radiusExplanation: string;
  userMessage: string;
}): string {
  return `O usuário pediu: "${params.userMessage}"

Confirme em português simples que vai ajudá-lo a encontrar ${params.categoryLabel}.
${params.radiusExplanation}
Seja breve e acolhedor.`;
}
