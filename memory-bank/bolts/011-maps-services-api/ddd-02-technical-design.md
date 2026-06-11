---
unit: 001-maps-services-api
bolt: 011-maps-services-api
stage: design
status: complete
created: 2026-06-08T23:01:12Z
---

# Technical Design - Maps Services API

## Architecture Pattern

**Modular monolith NestJS + DDD hexagonal** — novo módulo `maps` em `apps/backend`, sem persistência Prisma.

**Rationale**:

- Operações read-only via proxy HTTP para **Google Maps Platform** (Geocoding, Places Nearby Search, Directions).
- Ports na camada `application`/`domain`; adapters HTTP em `infrastructure/external`.
- Padrão alinhado aos módulos existentes (`knowledge-base`, `conversations`): controller → use cases → mappers → envelope API.
- Guest pode usar maps no MVP (sem `FirebaseAuthGuard`); rate limiting global protege abuso.

---

## Layer Structure

```text
apps/backend/src/modules/maps/
├── domain/
│   ├── entities/
│   │   ├── poi-result.entity.ts
│   │   ├── route-result.entity.ts
│   │   └── geocode-result.entity.ts
│   ├── value-objects/
│   │   ├── geo-point.vo.ts
│   │   ├── poi-category.vo.ts
│   │   ├── search-radius.vo.ts
│   │   └── place-query.vo.ts
│   ├── services/
│   │   ├── poi-category-mapper.service.ts
│   │   ├── geo-distance-calculator.service.ts
│   │   └── poi-response-normalizer.service.ts
│   └── errors/
│       └── domain.errors.ts
├── application/
│   ├── ports/
│   │   └── maps.gateways.ts
│   └── use-cases/
│       ├── search-pois.use-case.ts
│       ├── geocode-place.use-case.ts
│       └── get-static-route.use-case.ts
├── infrastructure/
│   ├── external/
│   │   ├── http-google-places.gateway.ts
│   │   ├── http-google-geocoding.gateway.ts
│   │   ├── http-google-directions.gateway.ts
│   │   └── maps-http.client.ts
│   ├── config/
│   │   └── maps.config.ts
│   └── cache/
│       └── in-memory-geocode.cache.ts
├── presentation/
│   ├── maps.controller.ts
│   ├── dto/
│   │   ├── search-pois.request.dto.ts
│   │   ├── geocode-place.request.dto.ts
│   │   └── get-route.request.dto.ts
│   └── mappers/
│       └── maps.mapper.ts
└── maps.module.ts
```

---

## API Design

Base path: **`/api/v1/maps`**

| Endpoint | Method | Auth | Request body | Response `data` |
|----------|--------|------|--------------|-----------------|
| `/api/v1/maps/search` | POST | Público (MVP) | `SearchPoisRequestDto` | `PoiSearchResponseDto` |
| `/api/v1/maps/geocode` | POST | Público (MVP) | `GeocodePlaceRequestDto` | `GeocodeResponseDto` |
| `/api/v1/maps/route` | POST | Público (MVP) | `GetRouteRequestDto` | `RouteResponseDto` |

### SearchPoisRequestDto

```json
{
  "lat": -22.9056,
  "lon": -47.0608,
  "category": "pharmacy",
  "radiusKm": 5
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `lat` | number | sim | [-90, 90] |
| `lon` | number | sim | [-180, 180] |
| `category` | enum | sim | `pharmacy`, `health_post`, `hospital`, `bank`, `post_office`, `supermarket` |
| `radiusKm` | number | não | `2`, `5` ou `10`; default `5` |

### PoiSearchResponseDto

```json
{
  "center": { "lat": -22.9056, "lon": -47.0608 },
  "radiusKm": 5,
  "category": "pharmacy",
  "results": [
    {
      "osmId": "node/123456",
      "name": "Farmácia Central",
      "address": "Rua Exemplo, 100",
      "lat": -22.906,
      "lon": -47.061,
      "distanceMeters": 450
    }
  ]
}
```

### GeocodePlaceRequestDto

```json
{
  "query": "Centro, Campinas"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `query` | string | sim | trim; min 2; max 200 chars |

### GeocodeResponseDto

```json
{
  "lat": -22.9056,
  "lon": -47.0608,
  "displayName": "Centro, Campinas, SP, Brasil"
}
```

### GetRouteRequestDto

```json
{
  "origin": { "lat": -22.9056, "lon": -47.0608 },
  "destination": { "lat": -22.9100, "lon": -47.0650 }
}
```

### RouteResponseDto

```json
{
  "polyline": "encoded_polyline_string",
  "distanceMeters": 1250,
  "durationSeconds": 180
}
```

Envelope via `ApiResponseInterceptor` + `HttpExceptionFilter` existentes (`{ data, meta }`).

---

## External HTTP Integration

| Serviço | URL | Propósito | Timeout |
|---------|-----|-----------|---------|
| **Geocoding API** | `https://maps.googleapis.com/maps/api/geocode/json` | Geocode cidade/bairro/CEP + reverse | 25s |
| **Places API (New)** | `POST https://places.googleapis.com/v1/places:searchNearby` | Busca POI por categoria + raio | 25s |
| **Routes API** | `POST https://routes.googleapis.com/directions/v2:computeRoutes` | Rota driving + polyline | 25s |

Autenticação: Geocoding usa query param `key`; Places e Routes usam header `X-Goog-Api-Key` + `X-Goog-FieldMask`.

### Places API (New) — searchNearby (exemplo `pharmacy`, raio 5 km)

```
POST https://places.googleapis.com/v1/places:searchNearby
Headers: X-Goog-Api-Key, X-Goog-FieldMask: places.id,places.displayName,...
Body: { "includedTypes": ["pharmacy"], "locationRestriction": { "circle": { ... } } }
```

Tipos por categoria gerados por `PoiCategoryMapper.toGooglePlaceType()`.

### Geocoding request

```
GET /geocode/json?address={encodedQuery}&key=...&language=pt-BR&region=br&components=country:BR
```

Suporta CEP (`13010-000`), bairro e cidade. Cache in-memory (ADR-002) reduz chamadas repetidas.

### Routes API — computeRoutes

```
POST https://routes.googleapis.com/directions/v2:computeRoutes
Headers: X-Goog-Api-Key, X-Goog-FieldMask: routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline
Body: { "origin": {...}, "destination": {...}, "travelMode": "DRIVE" }
```

Polyline em `routes[0].polyline.encodedPolyline` (formato encoded compatível com Flutter).

---

## Configuration (Environment)

| Variável | Default | Descrição |
|----------|---------|-----------|
| `GOOGLEMAPS_API_KEY` | — (obrigatória) | Chave Google Maps Platform (Geocoding + Places + Directions) |
| `MAPS_HTTP_TIMEOUT_MS` | `25000` | Timeout HTTP dos adapters |
| `MAPS_DEFAULT_RADIUS_KM` | `5` | Raio default busca POI |
| `MAPS_MAX_RADIUS_KM` | `10` | Raio máximo busca POI |
| `MAPS_USER_AGENT` | `ConectaGeracao/1.0 (...)` | User-Agent em requests HTTP |

Registradas via factory `createMapsConfigFromEnv()` no `MapsModule`.

---

## Data Persistence

**Nenhuma persistência Prisma neste bolt.**

| Dado | Storage | Retention |
|------|---------|-----------|
| Cache geocode | In-memory `Map<string, { result, expiresAt }>` | TTL 10 min |
| Resultados POI/rota | — | Não persistir (stateless) |

---

## Security Design

| Concern | Approach |
|---------|----------|
| **Authentication** | Endpoints públicos no MVP (guest + autenticado); story 001 explicita guest |
| **Authorization** | N/A neste bolt |
| **Rate limiting** | `ThrottlerGuard` global existente (30 req/min por IP) |
| **Input validation** | DTOs + `class-validator` na borda; VOs revalidam no domínio |
| **SSRF prevention** | URLs Google fixas; sem URL arbitrária do cliente |
| **Chave API** | `GOOGLEMAPS_API_KEY` somente no backend; nunca exposta ao Flutter |
| **Logging** | Sem coordenadas precisas em produção se PII concern; logar categoria + raio + requestId |

---

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| **Performance (p95 POI < 4s)** | Timeout 25s; cache geocode; resposta normalizada in-memory |
| **Reliability** | Retry 0 no MVP; erro 503/504 amigável; circuit breaker futuro |
| **Degradação graciosa** | `ExternalServiceUnavailable` → 503; `MapsSearchTimeout` → 504 |
| **Swagger** | `@ApiTags('maps')`, `@ApiOperation` nos 3 endpoints |
| **Observability** | Log Pino com `requestId`; métrica de latência por gateway (futuro) |

---

## Error Handling

| Cenário | HTTP | `error.code` | Mensagem (PT) |
|---------|------|--------------|---------------|
| Validação DTO (lat/lon/categoria) | 400 | `VALIDATION_ERROR` | Campos inválidos |
| Categoria inválida | 400 | `VALIDATION_ERROR` | Categoria de lugar inválida |
| Lugar não encontrado (Geocoding vazio) | 404 | `NOT_FOUND` | Lugar não encontrado |
| Rota indisponível (Directions) | 422 | `UNPROCESSABLE_ENTITY` | Não foi possível calcular a rota |
| Serviço Google indisponível | 503 | `SERVICE_UNAVAILABLE` | Serviço de mapas temporariamente indisponível |
| Busca POI timeout | 504 | `GATEWAY_TIMEOUT` | Busca demorou demais; tente novamente |
| Erro interno | 500 | `INTERNAL_ERROR` | Algo deu errado |

`MapsController` / exception filter mapeia `DomainError` → HTTP conforme tabela acima.

---

## Module Wiring

```text
MapsModule
├── controllers: [MapsController]
├── providers:
│   ├── SearchPoisUseCase, GeocodePlaceUseCase, GetStaticRouteUseCase
│   ├── PoiCategoryMapper, GeoDistanceCalculator, PoiResponseNormalizer
│   ├── { provide: POI_SEARCH_GATEWAY, useClass: HttpGooglePlacesGateway }
│   ├── { provide: GEOCODING_GATEWAY, useClass: HttpGoogleGeocodingGateway }
│   ├── { provide: ROUTE_GATEWAY, useClass: HttpGoogleDirectionsGateway }
│   └── InMemoryGeocodeCache
└── exports: [SearchPoisUseCase, GeocodePlaceUseCase, GetStaticRouteUseCase]
```

Registrar `MapsModule` em `AppModule`.

---

## Test Strategy

| Tipo | Alvo | Abordagem |
|------|------|-----------|
| **Unit** | VOs geográficos | Validação de limites e enum |
| **Unit** | `PoiCategoryMapper` | 6 categorias → Google Places `type` |
| **Unit** | `PoiResponseNormalizer` | Fallback nome/endereço; ordenação |
| **Unit** | Use cases | Mock dos 3 gateways; cenários sucesso/erro |
| **Unit** | Gateways HTTP | Mock `fetch` com respostas Google JSON |

Sem testes E2E contra APIs Google reais no CI (billing/quota).

---

## Stories Mapping

| Story | Entregável |
|-------|------------|
| **001-osm-proxy-endpoints** | 3 gateways Google, 3 use cases, 3 endpoints POST (contrato REST mantido) |
| **002-poi-category-queries** | `PoiCategory` enum + mapper Google Places, raio 2/5/10 km |

---

## Implementation Notes

1. **Token symbols**: `POI_SEARCH_GATEWAY`, `GEOCODING_GATEWAY`, `ROUTE_GATEWAY`.
2. **Campo `osmId`**: mantido na API; contém `place_id` do Google (compatibilidade mobile).
3. **Zero resultados POI**: HTTP 200 com `results: []` (não 404).
4. **Origem = destino na rota**: rejeitar no use case com 422 antes de chamar Directions.
5. **ADR-011**: substitui stack OSM backend (ADR-003); tiles Flutter continuam OSM.
