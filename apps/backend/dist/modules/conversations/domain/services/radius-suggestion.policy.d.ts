import { SearchRadius } from '../../../maps/domain/value-objects/search-radius.vo';
import { LocationContextHints } from './location-context-hints';
export declare class RadiusSuggestionPolicy {
    suggest(message: string, hints?: LocationContextHints): SearchRadius;
    explanation(radius: SearchRadius): string;
}
