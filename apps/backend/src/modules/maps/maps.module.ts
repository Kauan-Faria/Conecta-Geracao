import { Module } from '@nestjs/common';
import { SearchPoisUseCase } from './application/use-cases/search-pois.use-case';
import { GeocodePlaceUseCase } from './application/use-cases/geocode-place.use-case';
import { GetStaticRouteUseCase } from './application/use-cases/get-static-route.use-case';
import {
  GEOCODING_GATEWAY,
  POI_SEARCH_GATEWAY,
  ROUTE_GATEWAY,
} from './application/ports/maps.gateways';
import { PoiCategoryMapper } from './domain/services/poi-category-mapper.service';
import { GeoDistanceCalculator } from './domain/services/geo-distance-calculator.service';
import { PoiResponseNormalizer } from './domain/services/poi-response-normalizer.service';
import { InMemoryGeocodeCache } from './infrastructure/cache/in-memory-geocode.cache';
import { createMapsConfigFromEnv, MAPS_CONFIG } from './infrastructure/config/maps.config';
import { HttpGoogleGeocodingGateway } from './infrastructure/external/http-google-geocoding.gateway';
import { HttpGooglePlacesGateway } from './infrastructure/external/http-google-places.gateway';
import { HttpGoogleDirectionsGateway } from './infrastructure/external/http-google-directions.gateway';
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
    PoiResponseNormalizer,
    {
      provide: POI_SEARCH_GATEWAY,
      useClass: HttpGooglePlacesGateway,
    },
    {
      provide: GEOCODING_GATEWAY,
      useClass: HttpGoogleGeocodingGateway,
    },
    {
      provide: ROUTE_GATEWAY,
      useClass: HttpGoogleDirectionsGateway,
    },
    SearchPoisUseCase,
    GeocodePlaceUseCase,
    GetStaticRouteUseCase,
  ],
  exports: [SearchPoisUseCase, GeocodePlaceUseCase, GetStaticRouteUseCase],
})
export class MapsModule {}
