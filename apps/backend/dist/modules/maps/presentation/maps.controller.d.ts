import { SearchPoisUseCase } from '../application/use-cases/search-pois.use-case';
import { GeocodePlaceUseCase } from '../application/use-cases/geocode-place.use-case';
import { GetStaticRouteUseCase } from '../application/use-cases/get-static-route.use-case';
import { GeocodePlaceRequestDto, GetRouteRequestDto, SearchPoisRequestDto } from './dto/maps.request.dto';
export declare class MapsController {
    private readonly searchPois;
    private readonly geocodePlace;
    private readonly getStaticRoute;
    constructor(searchPois: SearchPoisUseCase, geocodePlace: GeocodePlaceUseCase, getStaticRoute: GetStaticRouteUseCase);
    search(body: SearchPoisRequestDto): Promise<import("./mappers/maps.mapper").PoiSearchResponseDto>;
    geocode(body: GeocodePlaceRequestDto): Promise<import("./mappers/maps.mapper").GeocodeResponseDto>;
    route(body: GetRouteRequestDto): Promise<import("./mappers/maps.mapper").RouteResponseDto>;
    private mapDomainError;
}
