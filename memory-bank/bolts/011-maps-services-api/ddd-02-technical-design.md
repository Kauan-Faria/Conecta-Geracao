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

- Operações read-only via proxy HTTP para APIs OSM externas.
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
│   │   └── osm-response-normalizer.service.ts
│   └── errors/
│       └── domain.errors.ts
├── application/
│   ├── ports/
│   │   ├── overpass.gateway.ts
│   │   ├── nominatim.gateway.ts
│   │   └── osrm.gateway.ts
│   └── use-cases/
│       ├── search-pois.use-case.ts
│       ├── geocode-place.use-case.ts
│       └── get-static-route.use-case.ts
├── infrastructure/
│   ├── external/
│   │   ├── http-overpass.gateway.ts
│   │   ├── http-nominatim.gateway.ts
│   │   └── http-osrm.gateway.ts
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

| Serviço | URL base (default) | Propósito | Timeout |
|---------|-------------------|-----------|---------|
| **Overpass** | `https://overpass-api.de/api/interpreter` | Busca POI `around:` | 25s |
| **Nominatim** | `https://nominatim.openstreetmap.org` | Geocoding forward | 10s |
| **OSRM** | `https://router.project-osrm.org` | Rota driving | 15s |

### Overpass query (exemplo `pharmacy`, raio 5 km)

```overpass
[out:json][timeout:25];
(
  node["amenity"="pharmacy"](around:5000,-22.9056,-47.0608);
  way["amenity"="pharmacy"](around:5000,-22.9056,-47.0608);
);
out center tags;
```

Filtros por categoria gerados por `PoiCategoryMapper` conforme domain model.

### Nominatim request

```
GET /search?q={encodedQuery}&format=json&limit=1&addressdetails=1
Headers:
  User-Agent: ConectaGeracao/1.0 (contact@conectageracao.app)
  Accept-Language: pt-BR,pt;q=0.9
```

**Rate limit**: max 1 req/s por instância — throttle interno no adapter + cache (abaixo).

### OSRM request

```
GET /route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=polyline&steps=false
```

---

## Configuration (Environment)

| Variável | Default | Descrição |
|----------|---------|-----------|
| `MAPS_OVERPASS_URL` | `https://overpass-api.de/api/interpreter` | Endpoint Overpass |
| `MAPS_NOMINATIM_URL` | `https://nominatim.openstreetmap.org` | Base Nominatim |
| `MAPS_OSRM_URL` | `https://router.project-osrm.org` | Base OSRM |
| `MAPS_USER_AGENT` | `ConectaGeracao/1.0 (contact@conectageracao.app)` | User-Agent obrigatório Nominatim |
| `MAPS_GEOCODE_CACHE_TTL_MS` | `600000` (10 min) | TTL cache geocode in-memory |
| `MAPS_NOMINATIM_MIN_INTERVAL_MS` | `1000` | Intervalo mínimo entre calls Nominatim |

Registradas via `ConfigModule` / `@nestjs/config` no `MapsModule`.

---

## Data Persistence

**Nenhuma persistência Prisma neste bolt.**

| Dado | Storage | Retention |
|------|---------|-----------|
| Cache geocode | In-memory `Map<string, { result, expiresAt }>` | TTL 10 min (configurável) |
| Resultados POI/rota | — | Não persistir (stateless) |

Redis avaliado no futuro se múltiplas instâncias Render; MVP single-instance aceita cache local.

---

## Security Design

| Concern | Approach |
|---------|----------|
| **Authentication** | Endpoints públicos no MVP (guest + autenticado); story 001 explicita guest |
| **Authorization** | N/A neste bolt |
| **Rate limiting** | `ThrottlerGuard` global existente (30 req/min por IP) |
| **Input validation** | DTOs + `class-validator` na borda; VOs revalidam no domínio |
| **SSRF prevention** | URLs base fixas via env; sem URL arbitrária do cliente |
| **Logging** | Sem coordenadas precisas em produção se PII concern; logar categoria + raio + requestId |

---

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| **Performance (p95 POI < 4s)** | Timeout Overpass 25s; cache geocode quente; resposta normalizada in-memory |
| **Reliability** | Retry 0 no MVP; erro 503/504 amigável; circuit breaker futuro |
| **Degradação graciosa** | `ExternalServiceUnavailable` → 503; `OverpassTimeout` → 504 |
| **Swagger** | `@ApiTags('maps')`, `@ApiOperation` nos 3 endpoints |
| **Observability** | Log Pino com `requestId`; métrica de latência por gateway (futuro) |

---

## Error Handling

| Cenário | HTTP | `error.code` | Mensagem (PT) |
|---------|------|--------------|---------------|
| Validação DTO (lat/lon/categoria) | 400 | `VALIDATION_ERROR` | Campos inválidos |
| Categoria inválida | 400 | `VALIDATION_ERROR` | Categoria de lugar inválida |
| Lugar não encontrado (Nominatim vazio) | 404 | `NOT_FOUND` | Lugar não encontrado |
| Rota indisponível (OSRM) | 422 | `UNPROCESSABLE_ENTITY` | Não foi possível calcular a rota |
| Serviço OSM indisponível | 503 | `SERVICE_UNAVAILABLE` | Serviço de mapas temporariamente indisponível |
| Overpass timeout | 504 | `GATEWAY_TIMEOUT` | Busca demorou demais; tente novamente |
| Erro interno | 500 | `INTERNAL_ERROR` | Algo deu errado |

`MapsController` / exception filter mapeia `DomainError` → HTTP conforme tabela acima.

---

## Module Wiring

```text
MapsModule
├── imports: [HttpModule.register({ timeout: 25000 }), ConfigModule]
├── controllers: [MapsController]
├── providers:
│   ├── SearchPoisUseCase, GeocodePlaceUseCase, GetStaticRouteUseCase
│   ├── PoiCategoryMapper, GeoDistanceCalculator, OsmResponseNormalizer
│   ├── { provide: OVERPASS_GATEWAY, useClass: HttpOverpassGateway }
│   ├── { provide: NOMINATIM_GATEWAY, useClass: HttpNominatimGateway }
│   ├── { provide: OSRM_GATEWAY, useClass: HttpOsrmGateway }
│   └── InMemoryGeocodeCache
└── exports: [SearchPoisUseCase, GeocodePlaceUseCase]  # para bolt 012 (chat)
```

Registrar `MapsModule` em `AppModule`.

---

## Test Strategy

| Tipo | Alvo | Abordagem |
|------|------|-----------|
| **Unit** | `GeoPoint`, `PoiCategory`, `SearchRadius`, `PlaceQuery` VOs | Validação de limites e enum |
| **Unit** | `PoiCategoryMapper` | 6 categorias → fragmentos Overpass corretos |
| **Unit** | `GeoDistanceCalculator` | Haversine conhecido |
| **Unit** | `OsmResponseNormalizer` | Fallback nome/endereço; ordenação |
| **Unit** | Use cases | Mock dos 3 gateways; cenários sucesso/erro |
| **Unit** | `MapsController` | Mock use cases; envelope + status HTTP |
| **Integration** | Gateways HTTP | `nock` ou `msw` mockando Overpass/Nominatim/OSRM |

Sem testes E2E contra APIs OSM reais no CI (instabilidade/rate limit).

---

## Stories Mapping

| Story | Entregável |
|-------|------------|
| **001-osm-proxy-endpoints** | 3 gateways HTTP, 3 use cases, 3 endpoints POST, erros 503/504/404/422 |
| **002-poi-category-queries** | `PoiCategory` enum + mapper, raio 2/5/10 km, normalização e sort por distância |

---

## Implementation Notes

1. **Token symbols**: `OVERPASS_GATEWAY`, `NOMINATIM_GATEWAY`, `OSRM_GATEWAY` como injection tokens.
2. **Result pattern**: use cases retornam `Result<T, DomainError>`; controller converte via mapper existente no projeto.
3. **Zero resultados POI**: HTTP 200 com `results: []` (não 404).
4. **Origem = destino na rota**: rejeitar no use case com 400 antes de chamar OSRM.
5. **Export use cases**: bolt `012` reutilizará `SearchPoisUseCase` / `GeocodePlaceUseCase` na extensão do chat.
