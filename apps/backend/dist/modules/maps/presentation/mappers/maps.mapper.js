"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPoiResultDto = toPoiResultDto;
exports.toPoiSearchResponse = toPoiSearchResponse;
exports.toGeocodeResponse = toGeocodeResponse;
exports.toRouteResponse = toRouteResponse;
function toPoiResultDto(result) {
    return {
        osmId: result.osmId,
        name: result.name,
        address: result.address,
        lat: result.lat,
        lon: result.lon,
        distanceMeters: result.distanceMeters,
    };
}
function toPoiSearchResponse(result) {
    return {
        center: { lat: result.center.lat, lon: result.center.lon },
        radiusKm: result.radius.kilometers,
        category: result.category.value,
        results: result.results.map(toPoiResultDto),
    };
}
function toGeocodeResponse(result) {
    return {
        lat: result.point.lat,
        lon: result.point.lon,
        displayName: result.displayName,
    };
}
function toRouteResponse(route) {
    return {
        polyline: route.route.polyline,
        distanceMeters: route.route.distanceMeters,
        durationSeconds: route.route.durationSeconds,
    };
}
//# sourceMappingURL=maps.mapper.js.map