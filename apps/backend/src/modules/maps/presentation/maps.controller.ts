import {
  BadRequestException,
  Controller,
  GatewayTimeoutException,
  NotFoundException,
  Post,
  ServiceUnavailableException,
  UnprocessableEntityException,
  Body,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchPoisUseCase } from '../application/use-cases/search-pois.use-case';
import { GeocodePlaceUseCase } from '../application/use-cases/geocode-place.use-case';
import { GetStaticRouteUseCase } from '../application/use-cases/get-static-route.use-case';
import { DomainError } from '../domain/errors/domain.errors';
import {
  GeocodePlaceRequestDto,
  GetRouteRequestDto,
  SearchPoisRequestDto,
} from './dto/maps.request.dto';
import {
  toGeocodeResponse,
  toPoiSearchResponse,
  toRouteResponse,
} from './mappers/maps.mapper';

@ApiTags('maps')
@Controller('maps')
export class MapsController {
  constructor(
    private readonly searchPois: SearchPoisUseCase,
    private readonly geocodePlace: GeocodePlaceUseCase,
    private readonly getStaticRoute: GetStaticRouteUseCase,
  ) {}

  @Post('search')
  @ApiOperation({ summary: 'Buscar POIs por categoria e raio' })
  async search(@Body() body: SearchPoisRequestDto) {
    const result = await this.searchPois.execute(body);
    if (!result.ok) throw this.mapDomainError(result.error);
    return toPoiSearchResponse(result.value);
  }

  @Post('geocode')
  @ApiOperation({ summary: 'Geocodificar texto em coordenadas' })
  async geocode(@Body() body: GeocodePlaceRequestDto) {
    const result = await this.geocodePlace.execute(body.query);
    if (!result.ok) throw this.mapDomainError(result.error);
    return toGeocodeResponse(result.value);
  }

  @Post('route')
  @ApiOperation({ summary: 'Calcular rota estática entre dois pontos' })
  async route(@Body() body: GetRouteRequestDto) {
    const result = await this.getStaticRoute.execute({
      originLat: body.origin.lat,
      originLon: body.origin.lon,
      destinationLat: body.destination.lat,
      destinationLon: body.destination.lon,
    });
    if (!result.ok) throw this.mapDomainError(result.error);
    return toRouteResponse(result.value);
  }

  private mapDomainError(error: DomainError): never {
    switch (error.code) {
      case 'PLACE_NOT_FOUND':
        throw new NotFoundException({
          error: { code: 'NOT_FOUND', message: error.message },
        });
      case 'ROUTE_NOT_FOUND':
      case 'SAME_ORIGIN_DESTINATION':
        throw new UnprocessableEntityException({
          error: { code: 'UNPROCESSABLE_ENTITY', message: error.message },
        });
      case 'EXTERNAL_SERVICE_UNAVAILABLE':
        throw new ServiceUnavailableException({
          error: { code: 'SERVICE_UNAVAILABLE', message: error.message },
        });
      case 'OVERPASS_TIMEOUT':
      case 'PROVIDER_TIMEOUT':
        throw new GatewayTimeoutException({
          error: { code: 'GATEWAY_TIMEOUT', message: error.message },
        });
      case 'INVALID_GEO_POINT':
      case 'INVALID_POI_CATEGORY':
      case 'INVALID_SEARCH_RADIUS':
      case 'INVALID_PLACE_QUERY':
        throw new BadRequestException({
          error: { code: 'VALIDATION_ERROR', message: error.message },
        });
      default:
        throw new BadRequestException({
          error: { code: 'VALIDATION_ERROR', message: error.message },
        });
    }
  }
}
