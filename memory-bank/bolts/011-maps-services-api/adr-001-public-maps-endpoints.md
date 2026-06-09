---
bolt: 011-maps-services-api
created: 2026-06-08T23:07:16Z
status: accepted
---

# ADR-001: Endpoints públicos de maps sem Firebase Auth no MVP

## Context

A API NestJS do projeto exige `FirebaseAuthGuard` na maioria dos módulos (`knowledge-base`, `conversations`, etc.). A story `001-osm-proxy-endpoints` explicita que **guest pode usar** busca de lugares, geocodificação e rota no MVP, permitindo que usuários não autenticados acessem mapas antes ou sem login.

Forçar auth bloquearia o fluxo guest-first do app e adicionaria fricção desnecessária para operações read-only que não expõem dados de usuário.

## Decision

Expor `POST /api/v1/maps/search`, `/geocode` e `/route` **sem** `FirebaseAuthGuard` no MVP. Proteção via `ThrottlerGuard` global (rate limit por IP) e validação rigorosa de DTOs.

Autenticação opcional pode ser adicionada em versão futura sem breaking change (guard aplicável por endpoint).

## Rationale

- Guest session já é suportada no app mobile; maps é funcionalidade de descoberta, não de dados pessoais.
- Endpoints são proxy stateless — não retornam nem persistem PII de usuários.
- Rate limiting global mitiga abuso de proxy OSM.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Firebase Auth obrigatório | Alinhado ao padrão dos demais módulos | Bloqueia guest; story 001 violada | Conflita com requisito MVP |
| API key por app | Controle fino de cliente | Complexidade extra no Flutter MVP | Over-engineering para MVP |
| Auth opcional (token enriquece quota) | Flexível | Dois caminhos de código | Adiar para pós-MVP |

## Consequences

### Positive

- Guest pode buscar POIs e rotas imediatamente após onboarding leve
- Menor fricção para usuários idosos no público-alvo
- Implementação simples no controller (sem guard)

### Negative

- Proxy OSM exposto a qualquer cliente que conheça a URL
- Rate limit por IP pode ser insuficiente contra abuso distribuído

### Risks

- **Abuso de proxy**: mitigado por ThrottlerGuard + monitoramento de latência; evoluir para API key ou auth se necessário
- **Custo indireto OSM**: chamadas passam pelos servidores públicos OSM, não por billing próprio — risco de rate limit compartilhado

## Related

- **Stories**: 001-osm-proxy-endpoints
- **Standards**: `system-architecture.md` (Security Patterns), `api-conventions.md`
- **Previous ADRs**: —
