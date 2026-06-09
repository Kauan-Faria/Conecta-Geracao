import { GeoPoint } from '../value-objects/geo-point.vo';
import { PoiCategory } from '../value-objects/poi-category.vo';
import { SearchRadius } from '../value-objects/search-radius.vo';
export interface PoiResultProps {
    osmId: string;
    name: string;
    address: string;
    lat: number;
    lon: number;
    distanceMeters: number;
}
export declare class PoiResult {
    readonly osmId: string;
    readonly name: string;
    readonly address: string;
    readonly lat: number;
    readonly lon: number;
    readonly distanceMeters: number;
    private constructor();
    static create(props: PoiResultProps): PoiResult;
}
export interface PoiSearchResultProps {
    center: GeoPoint;
    radius: SearchRadius;
    category: PoiCategory;
    results: PoiResult[];
}
export declare class PoiSearchResult {
    readonly center: GeoPoint;
    readonly radius: SearchRadius;
    readonly category: PoiCategory;
    readonly results: PoiResult[];
    private constructor();
    static create(props: PoiSearchResultProps): PoiSearchResult;
}
export interface GeocodeResultProps {
    point: GeoPoint;
    displayName: string;
}
export declare class GeocodeResult {
    readonly point: GeoPoint;
    readonly displayName: string;
    private constructor();
    static create(props: GeocodeResultProps): GeocodeResult;
}
export interface RouteResultProps {
    polyline: string;
    distanceMeters: number;
    durationSeconds: number;
}
export declare class RouteResult {
    readonly polyline: string;
    readonly distanceMeters: number;
    readonly durationSeconds: number;
    private constructor();
    static create(props: RouteResultProps): RouteResult;
}
export interface StaticRouteProps {
    origin: GeoPoint;
    destination: GeoPoint;
    route: RouteResult;
}
export declare class StaticRoute {
    readonly origin: GeoPoint;
    readonly destination: GeoPoint;
    readonly route: RouteResult;
    private constructor();
    static create(props: StaticRouteProps): StaticRoute;
}
