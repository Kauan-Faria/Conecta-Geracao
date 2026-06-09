---
bolt: 011-maps-services-api
created: 2026-06-08T23:07:16Z
status: accepted
---

# ADR-002: Cache in-memory para geocodificação Nominatim

## Context

Nominatim impõe **máximo 1 requisição por segundo** por instância e exige User-Agent identificável. Geocodificações repetidas ("Centro, Campinas") são prováveis quando usuários refinam buscas ou o app reenvia a mesma query.

`system-architecture.md` declara "sem cache na API no MVP" para dados de negócio Postgres, mas o unit brief recomenda cache TTL 5–15 min para geocode.

## Decision

Implementar **`InMemoryGeocodeCache`** no módulo `maps` com TTL configurável (default 10 min via `MAPS_GEOCODE_CACHE_TTL_MS`) e throttle de 1 req/s no adapter Nominatim (`MAPS_NOMINATIM_MIN_INTERVAL_MS`).

Não usar Redis neste bolt — deploy single-instance no Render no MVP.

## Rationale

- Respeita política Nominatim sem infraestrutura adicional.
- Melhora p95 de geocode para queries repetidas (meta NFR < 4s).
- Desvio do standard "sem cache API" é **escopado** a dados OSM efêmeros, não fonte da verdade de negócio.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Sem cache | Alinhado ao standard global | Hammer Nominatim; latência alta | Viola rate limit em uso real |
| Redis | Compartilhado entre instâncias | Infra extra; custo MVP | Over-engineering single-instance |
| Cache no Flutter apenas | Reduz calls do app | Não protege múltiplos clientes | Backend ainda precisa throttle |

## Consequences

### Positive

- Queries repetidas respondem em < 10 ms
- Menor risco de bloqueio por Nominatim
- Configuração via env sem redeploy de código

### Negative

- Cache não compartilhado entre instâncias Render (se escalar horizontalmente)
- Memória cresce com queries distintas (volume baixo no MVP)

### Risks

- **Stale geocode**: TTL 10 min aceitável para MVP; endereços raramente mudam em minutos
- **Multi-instance**: documentar migração para Redis quando escalar

## Related

- **Stories**: 001-osm-proxy-endpoints
- **Standards**: `system-architecture.md` (Caching Strategy)
- **Previous ADRs**: ADR-003 (dependência OSM)
