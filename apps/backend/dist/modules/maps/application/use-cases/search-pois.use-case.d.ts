import { Result } from '../../../../shared/result';
import { PoiSearchResult } from '../../domain/entities/maps.entities';
import { DomainError } from '../../domain/errors/domain.errors';
import { PoiCategoryMapper } from '../../domain/services/poi-category-mapper.service';
import { PoiResponseNormalizer } from '../../domain/services/poi-response-normalizer.service';
import { PoiSearchGateway } from '../ports/maps.gateways';
import { MapsConfig } from '../../infrastructure/config/maps.config';
export declare class SearchPoisUseCase {
    private readonly poiSearch;
    private readonly categoryMapper;
    private readonly normalizer;
    private readonly config;
    constructor(poiSearch: PoiSearchGateway, categoryMapper: PoiCategoryMapper, normalizer: PoiResponseNormalizer, config: MapsConfig);
    execute(input: {
        lat: number;
        lon: number;
        category: string;
        radiusKm?: number;
    }): Promise<Result<PoiSearchResult, DomainError>>;
}
