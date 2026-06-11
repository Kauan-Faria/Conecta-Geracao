---
bolt: 011-maps-services-api
created: 2026-06-08T23:07:16Z
updated: 2026-06-10T14:00:00Z
status: accepted
---

# ADR-002: Cache in-memory para geocodificação

## Context

Geocodificações repetidas ("Centro, Campinas", CEPs) são prováveis quando usuários refinam buscas ou o app reenvia a mesma query. Com **Google Geocoding API** (ADR-011), cada chamada consome quota e adiciona latência.

`system-architecture.md` declara "sem cache na API no MVP" para dados de negócio Postgres, mas o unit brief recomenda cache TTL 5–15 min para geocode.

> **Histórico**: decisão original visava rate limit Nominatim (1 req/s). Mantida após migração para Google para reduzir quota e melhorar p95.

## Decision

Implementar **`InMemoryGeocodeCache`** no módulo `maps` com TTL configurável (default 10 min via `geocodeCacheTtlMs` em `MapsConfig`).

Não usar Redis neste bolt — deploy single-instance no Render no MVP.

## Rationale

- Reduz chamadas repetidas à Geocoding API (quota/billing).
- Melhora p95 de geocode para queries repetidas (meta NFR < 3s).
- Desvio do standard "sem cache API" é **escopado** a dados efêmeros de geocode, não fonte da verdade de negócio.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Sem cache | Alinhado ao standard global | Quota alta; latência repetida | Uso real repete queries |
| Redis | Compartilhado entre instâncias | Infra extra; custo MVP | Over-engineering single-instance |
| Cache no Flutter apenas | Reduz calls do app | Não protege múltiplos clientes | Backend ainda precisa cache |

## Consequences

### Positive

- Queries repetidas respondem em < 10 ms
- Menor consumo de quota Google
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
- **Previous ADRs**: ADR-011 (Google Maps Platform)
