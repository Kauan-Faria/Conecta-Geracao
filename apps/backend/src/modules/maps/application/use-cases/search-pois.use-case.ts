import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from '../../../../shared/result';
import { PoiSearchResult } from '../../domain/entities/maps.entities';
import { DomainError } from '../../domain/errors/domain.errors';
import { PoiCategoryMapper } from '../../domain/services/poi-category-mapper.service';
import { PoiResponseNormalizer } from '../../domain/services/poi-response-normalizer.service';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { PoiCategory } from '../../domain/value-objects/poi-category.vo';
import { SearchRadius } from '../../domain/value-objects/search-radius.vo';
import { POI_SEARCH_GATEWAY, PoiSearchGateway } from '../ports/maps.gateways';
import { MAPS_CONFIG, MapsConfig } from '../../infrastructure/config/maps.config';

@Injectable()
export class SearchPoisUseCase {
  constructor(
    @Inject(POI_SEARCH_GATEWAY)
    private readonly poiSearch: PoiSearchGateway,
    private readonly categoryMapper: PoiCategoryMapper,
    private readonly normalizer: PoiResponseNormalizer,
    @Inject(MAPS_CONFIG)
    private readonly config: MapsConfig,
  ) {}

  async execute(input: {
    lat: number;
    lon: number;
    category: string;
    radiusKm?: number;
  }): Promise<Result<PoiSearchResult, DomainError>> {
    try {
      const center = GeoPoint.create(input.lat, input.lon);
      const category = PoiCategory.create(input.category);
      const radius = SearchRadius.create(
        input.radiusKm,
        this.config.defaultRadiusKm,
        this.config.maxRadiusKm,
      );
      const placeType = this.categoryMapper.toGooglePlaceType(category);

      const raw = await this.poiSearch.searchAround(center, radius.toMeters(), placeType);
      const results = this.normalizer.normalizePois(raw, center);

      return ok(
        PoiSearchResult.create({
          center,
          radius,
          category,
          results,
        }),
      );
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }
  }
}
