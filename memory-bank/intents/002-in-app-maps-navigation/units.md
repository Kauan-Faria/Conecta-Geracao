---
intent: 002-in-app-maps-navigation
phase: inception
status: units-decomposed
updated: 2026-06-08T20:00:00Z
---

# Mapas e lugares próximos — Unit Decomposition

## Requirement-to-Unit Mapping

| FR | Requirement | Unit |
|----|-------------|------|
| FR-1 | Nova aba Mapas no shell | `002-in-app-maps-navigation-ui` |
| FR-2 | Detecção de intenção de localização no chat | `001-maps-services-api` + `002-in-app-maps-navigation-ui` |
| FR-3 | Permissão de localização e fallback cidade/bairro | `002-in-app-maps-navigation-ui` |
| FR-4 | Busca de lugares no raio (POI) | `001-maps-services-api` + `002-in-app-maps-navigation-ui` |
| FR-5 | Exibição no mapa e rota estática | `001-maps-services-api` + `002-in-app-maps-navigation-ui` |
| FR-6 | Redirecionamento chat → Mapas | `002-in-app-maps-navigation-ui` |
| FR-7 | Busca direta na aba Mapas | `002-in-app-maps-navigation-ui` |
| FR-8 | Auxílio da IA na aba Mapas | `001-maps-services-api` + `002-in-app-maps-navigation-ui` |

## Units Overview

Este intent decompõe em **2 units**:

### Unit 1: `001-maps-services-api`

**Description**: Módulo backend NestJS — proxy OSM (Overpass, Nominatim, OSRM), mapeamento de categorias POI e extensão do assistente IA para intenção de localização.

**Stories**: 4 | **Complexity**: M | **Priority**: Must

**Deliverables**: Endpoints REST de busca POI, geocoding e rota; detecção de intenção geográfica no chat; resposta estruturada `map_action`.

**Dependencies**: `003-ai-assistant-api` (intent 001) para extensão do chat

---

### Unit 2: `002-in-app-maps-navigation-ui`

**Description**: UI mobile — aba Mapas, flutter_map, permissão GPS, busca direta, resultados, rota estática e handoff chat→mapa.

**Stories**: 8 | **Complexity**: L | **Priority**: Must

**Deliverables**: Nova aba no shell, tela de busca acessível, mapa com rota, integração com chat.

**Dependencies**: `001-maps-services-api`, shell existente (`001-mobile-auth-shell`), chat UI (`004-digital-guidance-ui`)

## Unit Dependency Graph

```text
003-ai-assistant-api (intent 001)
         │
         ▼
001-maps-services-api ──► 002-in-app-maps-navigation-ui
         ▲                           │
         │                           │
001-mobile-auth-shell ──────────────┘
004-digital-guidance-ui ────────────┘
```

## Execution Order

1. **Bolt 011–012**: `001-maps-services-api` (proxy OSM + extensão IA)
2. **Bolt 013–015**: `002-in-app-maps-navigation-ui` (aba Mapas end-to-end)
