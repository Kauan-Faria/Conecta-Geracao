---
unit: 001-maps-services-api
bolt: 011-maps-services-api
stage: model
status: complete
created: 2026-06-08T23:00:25Z
---

# Static Model - Maps Services API

## Bounded Context

**Maps Services — Google Maps Proxy & POI Search** — contexto backend que encapsula integrações com **Google Maps Platform** (Geocoding, Places Nearby Search, Directions) e expõe operações de busca de lugares, geocodificação e rota estática via REST.

**Fronteiras**:

- **Dentro**: validação de entrada geográfica, mapeamento das 6 categorias MVP para Google Places `type`, normalização de respostas Google, ordenação por distância, contratos REST (`/maps/search`, `/maps/geocode`, `/maps/route`).
- **Fora**: renderização de mapa (Flutter), permissão GPS, navegação turn-by-turn, detecção de intenção no chat e `map_action` (bolt `012`), persistência de histórico de buscas/trajetos.

---

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **PoiResult** | `osmId`, `name`, `address`, `lat`, `lon`, `distanceMeters` | `osmId` contém `place_id` Google (campo mantido por compatibilidade API); `name` fallback para endereço ou `"Local sem nome"` |
| **RouteResult** | `polyline`, `distanceMeters`, `durationSeconds` | `polyline` encoded (Google Directions); origem e destino distintos |
| **GeocodeResult** | `point: GeoPoint`, `displayName` | Retornado quando Geocoding API encontra ao menos um resultado |

> **Nota**: entidades são **read models** derivados de APIs externas — não há persistência local no MVP.

---

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **GeoPoint** | `lat: number`, `lon: number` | `lat ∈ [-90, 90]`; `lon ∈ [-180, 180]`; precisão até 6 casas decimais |
| **PoiCategory** | `value: enum` | Valores MVP: `pharmacy`, `health_post`, `hospital`, `bank`, `post_office`, `supermarket`; inválido → erro de validação (400) |
| **SearchRadius** | `kilometers: 2 \| 5 \| 10` | Default `5` quando omitido; usado no Places Nearby Search (`radius`) |
| **PlaceQuery** | `text: string` | Trim; mínimo 2 chars; máximo 200 chars; geocodificação via Geocoding API (CEP, bairro, cidade) |
| **PlaceId** | `value: string` | `place_id` Google; exposto como `osmId` na API por compatibilidade |
| **DistanceMeters** | `value: number` | ≥ 0; arredondado para inteiro na resposta API |
| **EncodedPolyline** | `value: string` | Polyline encoded do Google Directions; não vazia quando rota existe |

---

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| **PoiSearchResult** | `PoiResult[]`, `center: GeoPoint`, `radius: SearchRadius`, `category: PoiCategory` | Lista pode ser vazia (200 OK); todos os POIs dentro do raio informado; ordenados por `distanceMeters` asc |
| **StaticRoute** | `RouteResult`, `origin: GeoPoint`, `destination: GeoPoint` | Origem ≠ destino; falha Directions → erro de domínio mapeado para 422 com mensagem amigável |

---

## Domain Events

Nenhum evento de domínio neste bolt (operações read-only via proxy HTTP; sem persistência).

---

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| **PoiCategoryMapper** | `toGooglePlaceType(category: PoiCategory): string` | Tabela categoria → Google Places `type` |
| **GeoDistanceCalculator** | `haversineMeters(from: GeoPoint, to: GeoPoint): DistanceMeters` | Ordenação e campo `distanceMeters` |
| **PoiResponseNormalizer** | `normalizePois(raw: ExternalPoiEntry[], center: GeoPoint): PoiResult[]` | Extrai nome, endereço, coordenadas; fallbacks e distância |

### Mapeamento PoiCategory → Google Places type (MVP)

| PoiCategory | Google Places `type` |
|-------------|---------------------|
| `pharmacy` | pharmacy |
| `health_post` | doctor |
| `hospital` | hospital |
| `bank` | bank |
| `post_office` | post_office |
| `supermarket` | supermarket |

> Tags variam por região; queries devem ser validadas em cidades de teste (nota do unit brief).

---

## Repository Interfaces (Ports)

| Repository | Entity / Retorno | Methods |
|------------|------------------|---------|
| **PoiSearchGateway** | `ExternalPoiEntry[]` | `searchAround(center: GeoPoint, radiusMeters: number, placeType: string): Promise<ExternalPoiEntry[]>` |
| **GeocodingGateway** | `GeocodeResult` | `geocode(query: PlaceQuery): Promise<GeocodeResult \| null>`; `reverseGeocode(point: GeoPoint)` |
| **RouteGateway** | `RouteResult` | `getRoute(origin: GeoPoint, destination: GeoPoint): Promise<RouteResult \| null>` |

> Aliases deprecados `OverpassGateway`, `NominatimGateway`, `OsrmGateway` mantidos em `maps.gateways.ts` por compatibilidade.

**Contratos de erro (domínio → HTTP)**:

| Erro de domínio | HTTP | Mensagem amigável (PT) |
|-----------------|------|------------------------|
| `ExternalServiceUnavailable` | 503 | Serviço de mapas temporariamente indisponível |
| `MapsSearchTimeout` | 504 | Busca demorou demais; tente novamente |
| `PlaceNotFound` | 404 | Lugar não encontrado |
| `RouteNotFound` | 422 | Não foi possível calcular a rota |
| `InvalidPoiCategory` | 400 | Categoria de lugar inválida |
| `InvalidGeoPoint` | 400 | Coordenadas inválidas |

---

## Application Use Cases

| Use Case | Input | Output | Regras |
|----------|-------|--------|--------|
| **SearchPoisUseCase** | `center: GeoPoint`, `radiusKm?: SearchRadius`, `category: PoiCategory` | `Result<PoiSearchResult, DomainError>` | Default raio 5 km; mapper → Places → normalizer → sort by distance |
| **GeocodePlaceUseCase** | `query: PlaceQuery` | `Result<GeocodeResult, DomainError>` | 404 se Geocoding retorna vazio; cache TTL curto (infra) |
| **GetStaticRouteUseCase** | `origin: GeoPoint`, `destination: GeoPoint` | `Result<StaticRoute, DomainError>` | Valida pontos distintos; delega a Directions API |

---

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **POI** | Point of Interest — estabelecimento retornado pelo Google Places |
| **Places Nearby Search** | API Google para busca espacial por tipo e raio |
| **Geocoding API** | Serviço Google (texto/CEP → coordenadas) |
| **Directions API** | Serviço Google — rota estática e polyline encoded |
| **Raio de busca** | Distância em km (2, 5 ou 10) a partir do centro informado |
| **Proxy maps** | Backend centraliza chamadas Google; chave nunca no mobile |
| **Envelope API** | Resposta `{ data, meta }` conforme `api-conventions.md` |

---

## Stories Coverage

| Story | Cobertura no modelo |
|-------|---------------------|
| **001-osm-proxy-endpoints** | Ports `PoiSearchGateway`, `GeocodingGateway`, `RouteGateway`; use cases `SearchPois`, `GeocodePlace`, `GetStaticRoute`; erros 503/504/404/422 |
| **002-poi-category-queries** | VO `PoiCategory`, `SearchRadius`; service `PoiCategoryMapper`; aggregate `PoiSearchResult`; normalização e ordenação por distância |

---

## Diagrama (fluxo de busca POI)

```text
HTTP POST /maps/search
       │
       ▼
MapsController
       │
       ▼
SearchPoisUseCase
       │
       ├─► PoiCategoryMapper.toGooglePlaceType(category)
       │
       ├─► PoiSearchGateway.searchAround(center, radius, placeType)
       │
       ├─► PoiResponseNormalizer.normalizePois(raw, center)
       │
       └─► GeoDistanceCalculator + sort → PoiSearchResult
```

## Diagrama (fluxo geocode / rota)

```text
POST /maps/geocode          POST /maps/route
       │                            │
       ▼                            ▼
GeocodePlaceUseCase          GetStaticRouteUseCase
       │                            │
       ▼                            ▼
GeocodingGateway.geocode     RouteGateway.getRoute
       │                            │
       ▼                            ▼
GeocodeResult                StaticRoute (polyline + métricas)
```
