"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadiusSuggestionPolicy = void 0;
const search_radius_vo_1 = require("../../../maps/domain/value-objects/search-radius.vo");
const DEFAULT_RADIUS_KM = 5;
const MAX_RADIUS_KM = 10;
class RadiusSuggestionPolicy {
    suggest(message, hints = {}) {
        const normalized = message.toLowerCase();
        if (hints.userRequestedNarrower ||
            /\b(bem perto|pertinho|só pertinho|bem aqui perto|bem pertinho)\b/.test(normalized)) {
            return search_radius_vo_1.SearchRadius.create(2, DEFAULT_RADIUS_KM, MAX_RADIUS_KM);
        }
        if (hints.userRequestedWider ||
            hints.isRural ||
            /\b(mais longe|amplia|aumenta|região maior|área maior|busca maior)\b/.test(normalized)) {
            return search_radius_vo_1.SearchRadius.create(10, DEFAULT_RADIUS_KM, MAX_RADIUS_KM);
        }
        return search_radius_vo_1.SearchRadius.create(undefined, DEFAULT_RADIUS_KM, MAX_RADIUS_KM);
    }
    explanation(radius) {
        if (radius.kilometers === 2) {
            return 'Vou procurar bem pertinho — em um raio de cerca de 2 km.';
        }
        if (radius.kilometers === 10) {
            return 'Vou ampliar a busca para cerca de 10 km.';
        }
        return 'Vou procurar em um raio de 5 km ao redor de você.';
    }
}
exports.RadiusSuggestionPolicy = RadiusSuggestionPolicy;
//# sourceMappingURL=radius-suggestion.policy.js.map