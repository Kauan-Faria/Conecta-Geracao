---
id: 004-radius-suggestion-response
unit: 001-maps-services-api
intent: 002-in-app-maps-navigation
status: complete
priority: should
created: 2026-06-08T20:00:00Z
assigned_bolt: 012-maps-services-api
implemented: true
---

# Story: 004-radius-suggestion-response

## User Story

**As a** usuário buscando um lugar
**I want** que a IA sugira distância de busca (2, 5 ou 10 km)
**So that** encontre resultados sem precisar entender o que é "raio"

## Acceptance Criteria

- [ ] **Given** intenção geográfica detectada, **When** IA responde, **Then** sugere raio padrão 5 km em linguagem simples ("vou procurar em um raio de 5 km")
- [ ] **Given** contexto urbano denso, **When** IA julga perto, **Then** pode sugerir 2 km com confirmação
- [ ] **Given** contexto rural ou poucos resultados, **When** IA sugere, **Then** pode propor 10 km
- [ ] **Given** map_action emitido, **When** app recebe, **Then** campo `radiusKm` é 2, 5 ou 10 (default 5)

## Technical Notes

- Prompt inclui regras: default 5; 2 km centros urbanos; 10 km áreas afastadas
- Usuário confirma no chat antes de buscar (checkpoint existente)

## Dependencies

### Requires
- 003-location-intent-chat

### Enables
- 007-chat-to-maps-handoff

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Usuário diz "mais longe" | IA aumenta para 10 km |
| Usuário diz "só pertinho" | IA reduz para 2 km |

## Out of Scope

- Raio customizado fora de 2/5/10 km
- UI seletor de raio (story UI 004)
