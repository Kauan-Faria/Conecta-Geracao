"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderTimeoutError = exports.OverpassTimeoutError = exports.MapsSearchTimeoutError = exports.ExternalServiceUnavailableError = exports.RouteNotFoundError = exports.PlaceNotFoundError = exports.SameOriginDestinationError = exports.InvalidPlaceQueryError = exports.InvalidSearchRadiusError = exports.InvalidPoiCategoryError = exports.InvalidGeoPointError = exports.DomainError = void 0;
class DomainError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'DomainError';
    }
}
exports.DomainError = DomainError;
class InvalidGeoPointError extends DomainError {
    constructor(message = 'Coordenadas inválidas') {
        super('INVALID_GEO_POINT', message);
    }
}
exports.InvalidGeoPointError = InvalidGeoPointError;
class InvalidPoiCategoryError extends DomainError {
    constructor(category) {
        super('INVALID_POI_CATEGORY', `Categoria de lugar inválida: ${category}`);
    }
}
exports.InvalidPoiCategoryError = InvalidPoiCategoryError;
class InvalidSearchRadiusError extends DomainError {
    constructor(message = 'Raio de busca inválido') {
        super('INVALID_SEARCH_RADIUS', message);
    }
}
exports.InvalidSearchRadiusError = InvalidSearchRadiusError;
class InvalidPlaceQueryError extends DomainError {
    constructor(message = 'Consulta de lugar inválida') {
        super('INVALID_PLACE_QUERY', message);
    }
}
exports.InvalidPlaceQueryError = InvalidPlaceQueryError;
class SameOriginDestinationError extends DomainError {
    constructor() {
        super('SAME_ORIGIN_DESTINATION', 'Origem e destino devem ser diferentes');
    }
}
exports.SameOriginDestinationError = SameOriginDestinationError;
class PlaceNotFoundError extends DomainError {
    constructor() {
        super('PLACE_NOT_FOUND', 'Lugar não encontrado');
    }
}
exports.PlaceNotFoundError = PlaceNotFoundError;
class RouteNotFoundError extends DomainError {
    constructor() {
        super('ROUTE_NOT_FOUND', 'Não foi possível calcular a rota');
    }
}
exports.RouteNotFoundError = RouteNotFoundError;
class ExternalServiceUnavailableError extends DomainError {
    constructor(service) {
        super('EXTERNAL_SERVICE_UNAVAILABLE', `Serviço de mapas temporariamente indisponível (${service})`);
    }
}
exports.ExternalServiceUnavailableError = ExternalServiceUnavailableError;
class MapsSearchTimeoutError extends DomainError {
    constructor() {
        super('MAPS_SEARCH_TIMEOUT', 'Busca demorou demais; tente novamente');
    }
}
exports.MapsSearchTimeoutError = MapsSearchTimeoutError;
class OverpassTimeoutError extends MapsSearchTimeoutError {
}
exports.OverpassTimeoutError = OverpassTimeoutError;
class ProviderTimeoutError extends DomainError {
    constructor(service) {
        super('PROVIDER_TIMEOUT', `Serviço de mapas demorou demais (${service})`);
    }
}
exports.ProviderTimeoutError = ProviderTimeoutError;
//# sourceMappingURL=domain.errors.js.map