import { Result } from '../../../../shared/result';
import { PoiSearchResult } from '../../domain/entities/maps.entities';
import { DomainError } from '../../domain/errors/domain.errors';
import { PoiCategoryMapper } from '../../domain/services/poi-category-mapper.service';
import { OsmResponseNormalizer } from '../../domain/services/osm-response-normalizer.service';
import { OverpassGateway } from '../ports/maps.gateways';
import { MapsConfig } from '../../infrastructure/config/maps.config';
export declare class SearchPoisUseCase {
    private readonly overpass;
    private readonly categoryMapper;
    private readonly normalizer;
    private readonly config;
    constructor(overpass: OverpassGateway, categoryMapper: PoiCategoryMapper, normalizer: OsmResponseNormalizer, config: MapsConfig);
    execute(input: {
        lat: number;
        lon: number;
        category: string;
        radiusKm?: number;
    }): Promise<Result<PoiSearchResult, DomainError>>;
}
