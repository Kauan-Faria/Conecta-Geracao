---
unit: 001-maps-services-api
intent: 002-in-app-maps-navigation
phase: inception
status: complete
created: 2026-06-08T20:00:00Z
updated: 2026-06-09T00:45:00Z
---

# Unit Brief: Maps Services API

## Purpose

Módulo backend NestJS que expõe endpoints REST para busca de POIs, geocodificação e rota estática via stack OSM gratuita, e estende o assistente IA para detectar intenções de localização no chat.

## Scope

### In Scope
- Proxy/cache para Overpass API, Nominatim e OSRM
- Mapeamento das 6 categorias MVP para queries Overpass
- Endpoints: `POST /maps/search`, `POST /maps/geocode`, `POST /maps/route`
- Extensão do fluxo de chat: detecção de intenção geográfica + payload `map_action`
- Sugestão de raio (2, 5 ou 10 km) na resposta estruturada da IA

### Out of Scope
- Renderização de mapa (Flutter)
- Permissão GPS no dispositivo
- Navegação turn-by-turn
- Persistência de histórico de buscas/trajetos

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-2 | Detecção de intenção de localização no chat | Must |
| FR-4 | Busca de lugares no raio (backend) | Must |
| FR-5 | Rota estática (backend — polyline OSRM) | Must |
| FR-8 | Auxílio da IA (backend — sugestão raio/categoria) | Should |

---

## Domain Concepts

### Key Entities

| Entity | Description | Attributes |
|--------|-------------|------------|
| PoiCategory | Categoria de estabelecimento MVP | enum: pharmacy, health_post, hospital, bank, post_office, supermarket |
| GeoPoint | Coordenada geográfica | lat, lon |
| PoiResult | Estabelecimento encontrado | osmId, name, address, lat, lon, distanceMeters |
| MapAction | Ação estruturada para o app mobile | category, radiusKm, center, selectedPoi? |
| RouteResult | Rota estática | polyline, distanceMeters, durationSeconds |

### Key Operations

| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| searchPois | Busca POIs no raio | center, radiusKm, category | PoiResult[] |
| geocodePlace | Cidade/bairro → coordenadas | query text | GeoPoint |
| getStaticRoute | Rota A→B | origin, destination | RouteResult |
| detectLocationIntent | IA identifica busca geográfica | chat message | MapAction draft |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 4 |
| Must Have | 3 |
| Should Have | 1 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-osm-proxy-endpoints | Proxy Overpass/Nominatim/OSRM | Must | Planned |
| 002-poi-category-queries | Mapeamento 6 categorias Overpass | Must | Planned |
| 003-location-intent-chat | Detecção intenção no chat | Must | Planned |
| 004-radius-suggestion-response | Sugestão raio 2/5/10 km | Should | Planned |

---

## Dependencies

### Depends On

| Unit | Reason |
|------|--------|
| 003-ai-assistant-api (intent 001) | Estender orquestração LLM existente |

### Depended By

| Unit | Reason |
|------|--------|
| 002-in-app-maps-navigation-ui | Consome endpoints REST e map_action |

### External Dependencies

| System | Purpose | Risk |
|--------|---------|------|
| Overpass API | Busca POIs OSM | Médio |
| Nominatim | Geocoding cidade/bairro | Médio |
| OSRM | Rota estática | Médio |
| Provedor LLM | Detecção intenção | Baixo |

---

## Technical Context

### Suggested Technology
- NestJS module `maps` com HttpService/axios
- Cache in-memory ou Redis leve para Nominatim (TTL 5–15 min)
- User-Agent identificável conforme política Nominatim

### Integration Points

| Integration | Type | Protocol |
|-------------|------|----------|
| Flutter app | REST API | JSON/HTTPS |
| ai-assistant-api | Internal service | NestJS DI |
| Overpass/Nominatim/OSRM | External HTTP | HTTPS |

### Data Storage

| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Cache geocode/POI | In-memory/Redis | Baixo | TTL curto |
| Histórico trajetos | — | — | Não persistir no MVP |

---

## Constraints

- Respeitar rate limits Nominatim (max 1 req/s por instância)
- Não expor chaves de APIs pagas (não aplicável — stack gratuita)
- Respostas em português; erros amigáveis para o app exibir

---

## Success Criteria

### Functional
- [ ] Busca farmácia em 5 km retorna resultados ordenados por distância
- [ ] Geocode "Centro, São Paulo" retorna coordenadas válidas
- [ ] Rota estática retorna polyline decodificável pelo Flutter
- [ ] Chat com "farmácia mais próxima" retorna `map_action` estruturado

### Non-Functional
- [ ] p95 busca POI < 4s com cache quente
- [ ] Degradação graciosa com mensagem quando Overpass/OSRM indisponível

### Quality
- [ ] Testes unitários mapeamento categorias
- [ ] Testes integração com mocks Overpass/OSRM

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 011-maps-services-api | DDD | 001, 002 | Proxy OSM + categorias |
| 012-maps-services-api | DDD | 003, 004 | Extensão IA chat |

---

## Notes

- Tags OSM variam por região; validar queries em cidades dos testes de usuário
- Considerar fallback "linha reta" se OSRM público falhar
