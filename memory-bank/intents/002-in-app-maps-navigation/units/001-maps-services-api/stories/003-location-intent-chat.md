---
id: 003-location-intent-chat
unit: 001-maps-services-api
intent: 002-in-app-maps-navigation
status: complete
priority: must
created: 2026-06-08T20:00:00Z
assigned_bolt: 012-maps-services-api
implemented: true
---

# Story: 003-location-intent-chat

## User Story

**As a** usuário no chat
**I want** que o assistente entenda quando pergunto sobre lugares próximos
**So that** seja guiado para o mapa sem precisar saber usar apps de mapas

## Acceptance Criteria

- [ ] **Given** mensagem "qual farmácia mais próxima?", **When** IA processa, **Then** resposta inclui `map_action` com category=pharmacy
- [ ] **Given** mensagem ambígua "preciso de saúde perto", **When** IA processa, **Then** pergunta se é UBS ou hospital antes de emitir map_action
- [ ] **Given** intenção geográfica detectada, **When** resposta enviada, **Then** texto em português simples + payload estruturado para o app
- [ ] **Given** mensagem não geográfica ("como fazer PIX"), **When** IA processa, **Then** NÃO emite map_action (fluxo normal)

## Technical Notes

- Estender prompt/tool do `003-ai-assistant-api` com tool `search_nearby_place`
- `map_action` schema: `{ type: "map_search", category, radiusKm, center? }`
- Guardrails: não pedir endereço completo sensível; usar GPS ou bairro

## Dependencies

### Requires
- 002-poi-category-queries
- 003-ai-assistant-api (intent 001)

### Enables
- 007-chat-to-maps-handoff (UI)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Múltiplas categorias na mesma frase | IA pede para escolher uma |
| Pergunta sobre endereço fixo ("onde fica X?") | Geocode + pin no mapa (Could — MVP: tratar como busca) |

## Out of Scope

- UI de redirecionamento (story UI 007)
- Sugestão de raio (story 004)
