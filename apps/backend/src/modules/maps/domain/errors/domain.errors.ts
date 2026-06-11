export type DomainErrorCode =
  | 'INVALID_GEO_POINT'
  | 'INVALID_POI_CATEGORY'
  | 'INVALID_SEARCH_RADIUS'
  | 'INVALID_PLACE_QUERY'
  | 'SAME_ORIGIN_DESTINATION'
  | 'PLACE_NOT_FOUND'
  | 'ROUTE_NOT_FOUND'
  | 'EXTERNAL_SERVICE_UNAVAILABLE'
  | 'MAPS_SEARCH_TIMEOUT'
  | 'PROVIDER_TIMEOUT';

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class InvalidGeoPointError extends DomainError {
  constructor(message = 'Coordenadas inválidas') {
    super('INVALID_GEO_POINT', message);
  }
}

export class InvalidPoiCategoryError extends DomainError {
  constructor(category: string) {
    super('INVALID_POI_CATEGORY', `Categoria de lugar inválida: ${category}`);
  }
}

export class InvalidSearchRadiusError extends DomainError {
  constructor(message = 'Raio de busca inválido') {
    super('INVALID_SEARCH_RADIUS', message);
  }
}

export class InvalidPlaceQueryError extends DomainError {
  constructor(message = 'Consulta de lugar inválida') {
    super('INVALID_PLACE_QUERY', message);
  }
}

export class SameOriginDestinationError extends DomainError {
  constructor() {
    super('SAME_ORIGIN_DESTINATION', 'Origem e destino devem ser diferentes');
  }
}

export class PlaceNotFoundError extends DomainError {
  constructor() {
    super('PLACE_NOT_FOUND', 'Lugar não encontrado');
  }
}

export class RouteNotFoundError extends DomainError {
  constructor() {
    super('ROUTE_NOT_FOUND', 'Não foi possível calcular a rota');
  }
}

export class ExternalServiceUnavailableError extends DomainError {
  constructor(service: string) {
    super(
      'EXTERNAL_SERVICE_UNAVAILABLE',
      `Serviço de mapas temporariamente indisponível (${service})`,
    );
  }
}

export class MapsSearchTimeoutError extends DomainError {
  constructor() {
    super('MAPS_SEARCH_TIMEOUT', 'Busca demorou demais; tente novamente');
  }
}

/** @deprecated Use MapsSearchTimeoutError */
export class OverpassTimeoutError extends MapsSearchTimeoutError {}

export class ProviderTimeoutError extends DomainError {
  constructor(service: string) {
    super('PROVIDER_TIMEOUT', `Serviço de mapas demorou demais (${service})`);
  }
}
