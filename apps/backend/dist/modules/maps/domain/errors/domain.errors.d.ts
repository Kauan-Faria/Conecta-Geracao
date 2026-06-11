export type DomainErrorCode = 'INVALID_GEO_POINT' | 'INVALID_POI_CATEGORY' | 'INVALID_SEARCH_RADIUS' | 'INVALID_PLACE_QUERY' | 'SAME_ORIGIN_DESTINATION' | 'PLACE_NOT_FOUND' | 'ROUTE_NOT_FOUND' | 'EXTERNAL_SERVICE_UNAVAILABLE' | 'MAPS_SEARCH_TIMEOUT' | 'PROVIDER_TIMEOUT';
export declare class DomainError extends Error {
    readonly code: DomainErrorCode;
    constructor(code: DomainErrorCode, message: string);
}
export declare class InvalidGeoPointError extends DomainError {
    constructor(message?: string);
}
export declare class InvalidPoiCategoryError extends DomainError {
    constructor(category: string);
}
export declare class InvalidSearchRadiusError extends DomainError {
    constructor(message?: string);
}
export declare class InvalidPlaceQueryError extends DomainError {
    constructor(message?: string);
}
export declare class SameOriginDestinationError extends DomainError {
    constructor();
}
export declare class PlaceNotFoundError extends DomainError {
    constructor();
}
export declare class RouteNotFoundError extends DomainError {
    constructor();
}
export declare class ExternalServiceUnavailableError extends DomainError {
    constructor(service: string);
}
export declare class MapsSearchTimeoutError extends DomainError {
    constructor();
}
export declare class OverpassTimeoutError extends MapsSearchTimeoutError {
}
export declare class ProviderTimeoutError extends DomainError {
    constructor(service: string);
}
