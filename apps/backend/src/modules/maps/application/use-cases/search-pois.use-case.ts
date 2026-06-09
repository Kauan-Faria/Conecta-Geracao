import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from '../../../../shared/result';
import { PoiSearchResult } from '../../domain/entities/maps.entities';
import { DomainError } from '../../domain/errors/domain.errors';
import { PoiCategoryMapper } from '../../domain/services/poi-category-mapper.service';
import { OsmResponseNormalizer } from '../../domain/services/osm-response-normalizer.service';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { PoiCategory } from '../../domain/value-objects/poi-category.vo';
import { SearchRadius } from '../../domain/value-objects/search-radius.vo';
import { OVERPASS_GATEWAY, OverpassGateway } from '../ports/maps.gateways';
import { MAPS_CONFIG, MapsConfig } from '../../infrastructure/config/maps.config';

@Injectable()
export class SearchPoisUseCase {
  constructor(
    @Inject(OVERPASS_GATEWAY)
    private readonly overpass: OverpassGateway,
    private readonly categoryMapper: PoiCategoryMapper,
    private readonly normalizer: OsmResponseNormalizer,
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
      const tagFilters = this.categoryMapper.toOverpassFilters(category);

      const raw = await this.overpass.searchAround(center, radius.toMeters(), tagFilters);
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
