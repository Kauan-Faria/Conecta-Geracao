import {
  GeocodeResult,
  PoiResult,
  PoiSearchResult,
  StaticRoute,
} from '../../domain/entities/maps.entities';

export interface PoiResultDto {
  osmId: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  distanceMeters: number;
}

export interface PoiSearchResponseDto {
  center: { lat: number; lon: number };
  radiusKm: number;
  category: string;
  results: PoiResultDto[];
}

export interface GeocodeResponseDto {
  lat: number;
  lon: number;
  displayName: string;
}

export interface RouteResponseDto {
  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
}

export function toPoiResultDto(result: PoiResult): PoiResultDto {
  return {
    osmId: result.osmId,
    name: result.name,
    address: result.address,
    lat: result.lat,
    lon: result.lon,
    distanceMeters: result.distanceMeters,
  };
}

export function toPoiSearchResponse(result: PoiSearchResult): PoiSearchResponseDto {
  return {
    center: { lat: result.center.lat, lon: result.center.lon },
    radiusKm: result.radius.kilometers,
    category: result.category.value,
    results: result.results.map(toPoiResultDto),
  };
}

export function toGeocodeResponse(result: GeocodeResult): GeocodeResponseDto {
  return {
    lat: result.point.lat,
    lon: result.point.lon,
    displayName: result.displayName,
  };
}

export function toRouteResponse(route: StaticRoute): RouteResponseDto {
  return {
    polyline: route.route.polyline,
    distanceMeters: route.route.distanceMeters,
    durationSeconds: route.route.durationSeconds,
  };
}
