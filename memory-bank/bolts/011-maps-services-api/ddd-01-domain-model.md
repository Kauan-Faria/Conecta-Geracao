---
unit: 001-maps-services-api
bolt: 011-maps-services-api
stage: model
status: complete
created: 2026-06-08T23:00:25Z
---

# Static Model - Maps Services API

## Bounded Context

**Maps Services — OSM Proxy & POI Search** — contexto backend que encapsula integrações com a stack OpenStreetMap gratuita (Overpass, Nominatim, OSRM) e expõe operações de busca de lugares, geocodificação e rota estática via REST.

**Fronteiras**:

- **Dentro**: validação de entrada geográfica, mapeamento das 6 categorias MVP para queries Overpass, normalização de respostas OSM, ordenação por distância, contratos REST (`/maps/search`, `/maps/geocode`, `/maps/route`).
- **Fora**: renderização de mapa (Flutter), permissão GPS, navegação turn-by-turn, detecção de intenção no chat e `map_action` (bolt `012`), persistência de histórico de buscas/trajetos.

---

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **PoiResult** | `osmId`, `name`, `address`, `lat`, `lon`, `distanceMeters` | `name` fallback para endereço ou `"Local sem nome"`; `distanceMeters` calculado a partir do centro da busca; ordenação ascendente por distância |
| **RouteResult** | `polyline`, `distanceMeters`, `durationSeconds` | `polyline` codificada (OSRM); origem e destino devem ser coordenadas válidas distintas |
| **GeocodeResult** | `point: GeoPoint`, `displayName` | Retornado quando Nominatim encontra ao menos um resultado; `displayName` para exibição no app |

> **Nota**: entidades são **read models** derivados de APIs externas — não há persistência local no MVP.

---

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **GeoPoint** | `lat: number`, `lon: number` | `lat ∈ [-90, 90]`; `lon ∈ [-180, 180]`; precisão até 6 casas decimais |
| **PoiCategory** | `value: enum` | Valores MVP: `pharmacy`, `health_post`, `hospital`, `bank`, `post_office`, `supermarket`; inválido → erro de validação (400) |
| **SearchRadius** | `kilometers: 2 \| 5 \| 10` | Default `5` quando omitido; usado na query Overpass (`around:`) |
| **PlaceQuery** | `text: string` | Trim; mínimo 2 chars; máximo 200 chars; geocodificação via Nominatim |
| **OsmNodeId** | `value: string` | Identificador OSM normalizado (`node/123`, `way/456`, etc.) |
| **DistanceMeters** | `value: number` | ≥ 0; arredondado para inteiro na resposta API |
| **EncodedPolyline** | `value: string` | String OSRM; não vazia quando rota existe |

---

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| **PoiSearchResult** | `PoiResult[]`, `center: GeoPoint`, `radius: SearchRadius`, `category: PoiCategory` | Lista pode ser vazia (200 OK); todos os POIs dentro do raio informado; ordenados por `distanceMeters` asc |
| **StaticRoute** | `RouteResult`, `origin: GeoPoint`, `destination: GeoPoint` | Origem ≠ destino; falha OSRM → erro de domínio mapeado para 422 com mensagem amigável |

---

## Domain Events

Nenhum evento de domínio neste bolt (operações read-only via proxy HTTP; sem persistência).

---

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| **PoiCategoryMapper** | `toOverpassFilter(category: PoiCategory): OverpassFilter` | Tabela de mapeamento categoria → tags OSM (documentada abaixo) |
| **GeoDistanceCalculator** | `haversineMeters(from: GeoPoint, to: GeoPoint): DistanceMeters` | Fórmula haversine para ordenação e campo `distanceMeters` |
| **OsmResponseNormalizer** | `normalizePois(raw: OverpassElement[], center: GeoPoint): PoiResult[]` | Extrai nome, endereço, coordenadas; aplica fallbacks e calcula distância |

### Mapeamento PoiCategory → Overpass (MVP)

| PoiCategory | Tags OSM (Overpass filter) |
|-------------|----------------------------|
| `pharmacy` | `amenity=pharmacy` |
| `health_post` | `amenity=clinic` OR `healthcare=centre` OR `amenity=health_post` |
| `hospital` | `amenity=hospital` OR `emergency=emergency_ward_entrance` |
| `bank` | `amenity=bank` OR `amenity=bureau_de_change` OR `shop=lottery` |
| `post_office` | `amenity=post_office` |
| `supermarket` | `shop=supermarket` |

> Tags variam por região; queries devem ser validadas em cidades de teste (nota do unit brief).

---

## Repository Interfaces (Ports)

| Repository | Entity / Retorno | Methods |
|------------|------------------|---------|
| **OverpassGateway** | `PoiResult[]` (raw elements) | `searchAround(center: GeoPoint, radiusMeters: number, filter: OverpassFilter): Promise<OverpassElement[]>` |
| **NominatimGateway** | `GeocodeResult` | `geocode(query: PlaceQuery): Promise<GeocodeResult \| null>` |
| **OsrmGateway** | `RouteResult` | `getRoute(origin: GeoPoint, destination: GeoPoint): Promise<RouteResult>` |

**Contratos de erro (domínio → HTTP)**:

| Erro de domínio | HTTP | Mensagem amigável (PT) |
|-----------------|------|------------------------|
| `ExternalServiceUnavailable` | 503 | Serviço de mapas temporariamente indisponível |
| `OverpassTimeout` | 504 | Busca demorou demais; tente novamente |
| `PlaceNotFound` | 404 | Lugar não encontrado |
| `RouteNotFound` | 422 | Não foi possível calcular a rota |
| `InvalidPoiCategory` | 400 | Categoria de lugar inválida |
| `InvalidGeoPoint` | 400 | Coordenadas inválidas |

---

## Application Use Cases

| Use Case | Input | Output | Regras |
|----------|-------|--------|--------|
| **SearchPoisUseCase** | `center: GeoPoint`, `radiusKm?: SearchRadius`, `category: PoiCategory` | `Result<PoiSearchResult, DomainError>` | Default raio 5 km; mapper → Overpass → normalizer → sort by distance |
| **GeocodePlaceUseCase** | `query: PlaceQuery` | `Result<GeocodeResult, DomainError>` | 404 se Nominatim retorna vazio; cache TTL curto (infra) |
| **GetStaticRouteUseCase** | `origin: GeoPoint`, `destination: GeoPoint` | `Result<StaticRoute, DomainError>` | Valida pontos distintos; delega a OSRM |

---

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **POI** | Point of Interest — estabelecimento mapeado no OpenStreetMap |
| **Overpass** | API de consulta OSM para busca espacial de elementos |
| **Nominatim** | Serviço de geocodificação OSM (texto → coordenadas) |
| **OSRM** | Open Source Routing Machine — rota estática e polyline |
| **Raio de busca** | Distância em km (2, 5 ou 10) a partir do centro informado |
| **Proxy OSM** | Backend centraliza chamadas externas respeitando rate limits e User-Agent |
| **Envelope API** | Resposta `{ data, meta }` conforme `api-conventions.md` |

---

## Stories Coverage

| Story | Cobertura no modelo |
|-------|---------------------|
| **001-osm-proxy-endpoints** | Ports `OverpassGateway`, `NominatimGateway`, `OsrmGateway`; use cases `SearchPois`, `GeocodePlace`, `GetStaticRoute`; erros 503/504/404/422 |
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
       ├─► PoiCategoryMapper.toOverpassFilter(category)
       │
       ├─► OverpassGateway.searchAround(center, radius, filter)
       │
       ├─► OsmResponseNormalizer.normalizePois(raw, center)
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
NominatimGateway.geocode     OsrmGateway.getRoute
       │                            │
       ▼                            ▼
GeocodeResult                StaticRoute (polyline + métricas)
```
