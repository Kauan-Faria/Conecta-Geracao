"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticRoute = exports.RouteResult = exports.GeocodeResult = exports.PoiSearchResult = exports.PoiResult = void 0;
class PoiResult {
    constructor(props) {
        this.osmId = props.osmId;
        this.name = props.name;
        this.address = props.address;
        this.lat = props.lat;
        this.lon = props.lon;
        this.distanceMeters = props.distanceMeters;
    }
    static create(props) {
        return new PoiResult(props);
    }
}
exports.PoiResult = PoiResult;
class PoiSearchResult {
    constructor(props) {
        this.center = props.center;
        this.radius = props.radius;
        this.category = props.category;
        this.results = props.results;
    }
    static create(props) {
        return new PoiSearchResult(props);
    }
}
exports.PoiSearchResult = PoiSearchResult;
class GeocodeResult {
    constructor(props) {
        this.point = props.point;
        this.displayName = props.displayName;
    }
    static create(props) {
        return new GeocodeResult(props);
    }
}
exports.GeocodeResult = GeocodeResult;
class RouteResult {
    constructor(props) {
        this.polyline = props.polyline;
        this.distanceMeters = props.distanceMeters;
        this.durationSeconds = props.durationSeconds;
    }
    static create(props) {
        return new RouteResult(props);
    }
}
exports.RouteResult = RouteResult;
class StaticRoute {
    constructor(props) {
        this.origin = props.origin;
        this.destination = props.destination;
        this.route = props.route;
    }
    static create(props) {
        return new StaticRoute(props);
    }
}
exports.StaticRoute = StaticRoute;
//# sourceMappingURL=maps.entities.js.map