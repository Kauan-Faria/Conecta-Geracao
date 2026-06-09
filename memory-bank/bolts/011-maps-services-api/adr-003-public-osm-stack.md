---
bolt: 011-maps-services-api
created: 2026-06-08T23:07:16Z
status: accepted
---

# ADR-003: Stack OSM pública gratuita como dependência de maps

## Context

O MVP de maps precisa de busca POI, geocoding e rota estática **sem custo de APIs pagas** (Google Maps, Mapbox). OpenStreetMap oferece Overpass (POI), Nominatim (geocode) e OSRM (routing) via instâncias públicas gratuitas.

Esses serviços não têm SLA, sofrem rate limits compartilhados e podem ficar indisponíveis ou lentos.

## Decision

Usar instâncias públicas default configuráveis por env:

- Overpass: `https://overpass-api.de/api/interpreter`
- Nominatim: `https://nominatim.openstreetmap.org`
- OSRM: `https://router.project-osrm.org`

Backend atua como **proxy único** (User-Agent, timeout, normalização, erros amigáveis). Degradação: HTTP 503/504 com mensagens em português; zero resultados POI retorna 200 com array vazio.

## Rationale

- Zero custo alinhado ao MVP e stack gratuita do unit brief
- Proxy centraliza integração e facilita troca de URL (instância self-hosted futura)
- Timeouts explícitos (Overpass 25s, Nominatim 10s, OSRM 15s) evitam hang

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Google Maps Platform | SLA, qualidade | Custo; chaves expostas | Fora do escopo MVP |
| Self-hosted Overpass/OSRM | Controle total | Ops complexa | Adiar pós-validação |
| Linha reta sem OSRM | Sempre disponível | UX inferior na rota | Fallback futuro, não MVP |

## Consequences

### Positive

- Sem billing de mapas no MVP
- URLs substituíveis via env sem refactor de domínio
- Erros padronizados para o Flutter exibir mensagens amigáveis

### Negative

- Disponibilidade depende de terceiros
- Tags OSM variam por região — resultados inconsistentes em algumas áreas
- Rate limits podem afetar picos de uso

### Risks

- **Overpass timeout**: HTTP 504 + mensagem; considerar instância dedicada se recorrente
- **OSRM público indisponível**: HTTP 422; fallback linha reta documentado como evolução
- **Qualidade POI**: validar 6 categorias em cidades de teste de usuário

## Related

- **Stories**: 001-osm-proxy-endpoints, 002-poi-category-queries
- **Standards**: `tech-stack.md`, unit brief external dependencies
- **Previous ADRs**: ADR-002 (cache Nominatim)
