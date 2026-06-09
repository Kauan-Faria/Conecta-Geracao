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

export class PoiResult {
  readonly osmId: string;
  readonly name: string;
  readonly address: string;
  readonly lat: number;
  readonly lon: number;
  readonly distanceMeters: number;

  private constructor(props: PoiResultProps) {
    this.osmId = props.osmId;
    this.name = props.name;
    this.address = props.address;
    this.lat = props.lat;
    this.lon = props.lon;
    this.distanceMeters = props.distanceMeters;
  }

  static create(props: PoiResultProps): PoiResult {
    return new PoiResult(props);
  }
}

export interface PoiSearchResultProps {
  center: GeoPoint;
  radius: SearchRadius;
  category: PoiCategory;
  results: PoiResult[];
}

export class PoiSearchResult {
  readonly center: GeoPoint;
  readonly radius: SearchRadius;
  readonly category: PoiCategory;
  readonly results: PoiResult[];

  private constructor(props: PoiSearchResultProps) {
    this.center = props.center;
    this.radius = props.radius;
    this.category = props.category;
    this.results = props.results;
  }

  static create(props: PoiSearchResultProps): PoiSearchResult {
    return new PoiSearchResult(props);
  }
}

export interface GeocodeResultProps {
  point: GeoPoint;
  displayName: string;
}

export class GeocodeResult {
  readonly point: GeoPoint;
  readonly displayName: string;

  private constructor(props: GeocodeResultProps) {
    this.point = props.point;
    this.displayName = props.displayName;
  }

  static create(props: GeocodeResultProps): GeocodeResult {
    return new GeocodeResult(props);
  }
}

export interface RouteResultProps {
  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
}

export class RouteResult {
  readonly polyline: string;
  readonly distanceMeters: number;
  readonly durationSeconds: number;

  private constructor(props: RouteResultProps) {
    this.polyline = props.polyline;
    this.distanceMeters = props.distanceMeters;
    this.durationSeconds = props.durationSeconds;
  }

  static create(props: RouteResultProps): RouteResult {
    return new RouteResult(props);
  }
}

export interface StaticRouteProps {
  origin: GeoPoint;
  destination: GeoPoint;
  route: RouteResult;
}

export class StaticRoute {
  readonly origin: GeoPoint;
  readonly destination: GeoPoint;
  readonly route: RouteResult;

  private constructor(props: StaticRouteProps) {
    this.origin = props.origin;
    this.destination = props.destination;
    this.route = props.route;
  }

  static create(props: StaticRouteProps): StaticRoute {
    return new StaticRoute(props);
  }
}
