"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationIntentClassifier = void 0;
const NON_GEOGRAPHIC_PATTERNS = [
    /\b(como fazer|como usar|o que [eé]|me (explica|ajuda com))\b.*\b(pix|whatsapp|e-mail|email)\b/i,
    /\b(pix|whatsapp)\b.*\b(como|passo a passo|tutorial)\b/i,
    /\b(senha|token|otp|c[oó]digo de verifica[cç][aã]o)\b/i,
];
const GEOGRAPHIC_SIGNAL_PATTERNS = [
    /\b(perto|pr[oó]ximo|pr[oó]xima|por perto|mais pr[oó]ximo|mais pr[oó]xima)\b/i,
    /\b(onde (fica|tem|encontrar)|preciso de|quero achar|buscar|procurar)\b/i,
    /\bfarm[aá]cia\b/i,
    /\bbanco\b/i,
    /\bsupermercado\b/i,
    /\bmercado\b/i,
    /\bcorreios\b/i,
    /\bhospital\b/i,
    /\bubs\b/i,
    /\bposto de sa[uú]de\b/i,
    /\bsa[uú]de\b/i,
];
const CATEGORY_KEYWORDS = [
    { category: 'pharmacy', pattern: /\bfarm[aá]cia\b|\brem[eé]dio\b|\bdrogaria\b/i },
    { category: 'health_post', pattern: /\bubs\b|\bposto de sa[uú]de\b/i },
    { category: 'hospital', pattern: /\bhospital\b|\bupa\b/i },
    { category: 'bank', pattern: /\bbanco\b|\bcaixa eletr[oô]nico\b/i },
    { category: 'post_office', pattern: /\bcorreios\b/i },
    { category: 'supermarket', pattern: /\bsupermercado\b|\bmercado\b/i },
];
const HEALTH_AMBIGUOUS_PATTERN = /\b(sa[uú]de|posto de sa[uú]de|unidade de sa[uú]de|atendimento de sa[uú]de)\b/i;
class LocationIntentClassifier {
    analyze(message) {
        const normalized = message.toLowerCase();
        if (NON_GEOGRAPHIC_PATTERNS.some((p) => p.test(message))) {
            return { isGeographic: false, detectedCategories: [], isAmbiguousHealth: false, hints: {} };
        }
        const isGeographic = GEOGRAPHIC_SIGNAL_PATTERNS.some((p) => p.test(message));
        if (!isGeographic) {
            return { isGeographic: false, detectedCategories: [], isAmbiguousHealth: false, hints: {} };
        }
        const detectedCategories = CATEGORY_KEYWORDS.filter(({ pattern }) => pattern.test(message)).map(({ category }) => category);
        const isAmbiguousHealth = HEALTH_AMBIGUOUS_PATTERN.test(message) &&
            !detectedCategories.includes('health_post') &&
            !detectedCategories.includes('hospital');
        const hints = {
            userRequestedNarrower: /\b(bem perto|pertinho|só pertinho|bem aqui perto)\b/.test(normalized),
            userRequestedWider: /\b(mais longe|amplia|aumenta|região maior)\b/.test(normalized),
            isUrbanDense: /\b(centro|capital|grande cidade|cidade grande)\b/.test(normalized),
            isRural: /\b(zona rural|interior|distrito|longe do centro)\b/.test(normalized),
        };
        return { isGeographic: true, detectedCategories, isAmbiguousHealth, hints };
    }
}
exports.LocationIntentClassifier = LocationIntentClassifier;
//# sourceMappingURL=location-intent.classifier.js.map