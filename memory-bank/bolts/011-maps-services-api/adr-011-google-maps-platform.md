---
bolt: 011-maps-services-api
created: 2026-06-10T12:00:00Z
status: accepted
supersedes: adr-003-public-osm-stack
---

# ADR-011: Google Maps Platform como provedor backend de maps

## Context

O MVP iniciou com stack OSM gratuita (Overpass, Nominatim, OSRM) conforme ADR-003. Em desenvolvimento, Nominatim falhou em geocodificar cidade/bairro/CEP brasileiros com qualidade aceitável. Foi obtida chave de demonstração do **Google Maps Platform** para dev.

POI search, geocoding e rotas no backend passam a usar APIs Google via proxy NestJS, mantendo contratos REST existentes (`/maps/search`, `/maps/geocode`, `/maps/route`).

**Nota**: tiles do mapa no Flutter continuam OSM (`flutter_map`) — apenas o **backend proxy** migra para Google.

## Decision

Substituir adapters OSM por Google Maps Platform no `MapsModule`:

| Operação | API Google | Adapter |
|----------|-----------|---------|
| Geocode (cidade/bairro/CEP) | Geocoding API | `HttpGoogleGeocodingGateway` |
| Busca POI por categoria + raio | **Places API (New)** — `searchNearby` | `HttpGooglePlacesGateway` |
| Rota estática | **Routes API** — `computeRoutes` | `HttpGoogleDirectionsGateway` |

Configuração via env única: `GOOGLEMAPS_API_KEY`.

Mapeamento categorias MVP → Google Places `type`:

| Categoria app | Google Places type |
|---------------|-------------------|
| pharmacy | pharmacy |
| health_post | doctor |
| hospital | hospital |
| bank | bank |
| post_office | post_office |
| supermarket | supermarket |

Campo `osmId` na resposta REST **mantido por compatibilidade** — passa a conter `place_id` do Google.

Cache in-memory de geocode (ADR-002) **mantido** — reduz chamadas repetidas à Geocoding API.

## Rationale

- Geocoding brasileiro (CEP, bairro, cidade) funcional em dev
- POI e rotas com qualidade superior e SLA de demonstração Google
- Proxy NestJS preserva chave no servidor (não exposta ao app)
- Contratos REST inalterados — Flutter/mobile não precisa refactor de endpoints

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Manter OSM no backend | Gratuito | Geocode BR fraco; instabilidade | Problema reportado em dev |
| Google no Flutter direto | Menos latência | Expõe chave; viola proxy pattern | Chave deve ficar no backend |
| Híbrido OSM POI + Google geocode | Menor custo Google | Dois provedores; complexidade | Migração completa simplifica ops |

## Consequences

### Positive

- Busca por CEP/cidade/bairro confiável via Geocoding API
- POI e rotas consistentes no Brasil
- Um único provedor e uma env var no backend

### Negative

- Custo Google após créditos de demonstração
- ADR-003 (stack OSM backend) **supersedido**
- Campo `osmId` semanticamente impreciso (contém `place_id`)

### Risks

- **Quota/billing Google**: monitorar uso; ThrottlerGuard global mitiga abuso
- **APIs não habilitadas no projeto Google**: Geocoding + Places + Directions devem estar ativas
- **health_post → doctor**: cobertura pode diferir de UBS/posto de saúde OSM — validar em testes de usuário

## Related

- **Stories**: 001-osm-proxy-endpoints (contrato REST mantido), 002-poi-category-queries
- **Standards**: `tech-stack.md`, unit brief external dependencies
- **Previous ADRs**: ADR-003 (supersedido), ADR-002 (cache geocode mantido)
