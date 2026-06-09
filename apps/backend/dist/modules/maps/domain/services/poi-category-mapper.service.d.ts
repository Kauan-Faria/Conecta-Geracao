import { PoiCategory } from '../value-objects/poi-category.vo';
export type OverpassTagFilter = Record<string, string>;
export declare class PoiCategoryMapper {
    toOverpassFilters(category: PoiCategory): OverpassTagFilter[];
}
