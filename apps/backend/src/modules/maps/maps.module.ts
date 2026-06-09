import { Module } from '@nestjs/common';
import { SearchPoisUseCase } from './application/use-cases/search-pois.use-case';
import { GeocodePlaceUseCase } from './application/use-cases/geocode-place.use-case';
import { GetStaticRouteUseCase } from './application/use-cases/get-static-route.use-case';
import {
  NOMINATIM_GATEWAY,
  OSRM_GATEWAY,
  OVERPASS_GATEWAY,
} from './application/ports/maps.gateways';
import { PoiCategoryMapper } from './domain/services/poi-category-mapper.service';
import { GeoDistanceCalculator } from './domain/services/geo-distance-calculator.service';
import { OsmResponseNormalizer } from './domain/services/osm-response-normalizer.service';
import { InMemoryGeocodeCache } from './infrastructure/cache/in-memory-geocode.cache';
import { createMapsConfigFromEnv, MAPS_CONFIG } from './infrastructure/config/maps.config';
import { HttpOverpassGateway } from './infrastructure/external/http-overpass.gateway';
import { HttpNominatimGateway } from './infrastructure/external/http-nominatim.gateway';
import { HttpOsrmGateway } from './infrastructure/external/http-osrm.gateway';
import { MapsHttpClient } from './infrastructure/external/maps-http.client';
import { MapsController } from './presentation/maps.controller';

@Module({
  controllers: [MapsController],
  providers: [
    {
      provide: MAPS_CONFIG,
      useFactory: createMapsConfigFromEnv,
    },
    MapsHttpClient,
    InMemoryGeocodeCache,
    PoiCategoryMapper,
    GeoDistanceCalculator,
    OsmResponseNormalizer,
    {
      provide: OVERPASS_GATEWAY,
      useClass: HttpOverpassGateway,
    },
    {
      provide: NOMINATIM_GATEWAY,
      useClass: HttpNominatimGateway,
    },
    {
      provide: OSRM_GATEWAY,
      useClass: HttpOsrmGateway,
    },
    SearchPoisUseCase,
    GeocodePlaceUseCase,
    GetStaticRouteUseCase,
  ],
  exports: [SearchPoisUseCase, GeocodePlaceUseCase, GetStaticRouteUseCase],
})
export class MapsModule {}
