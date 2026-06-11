---
id: 005-tips-and-campaigns
unit: 001-notifications-api
intent: 003-push-notifications
status: complete
priority: should
created: 2026-06-08T23:30:00.000Z
assigned_bolt: 018-notifications-api
implemented: true
---

# Story: 005-tips-and-campaigns

## User Story

**As a** operador interno
**I want** enviar dicas educativas periódicas e campanhas manuais via backend
**So that** usuários recebam conteúdo útil sem painel admin no MVP

## Acceptance Criteria

- [ ] **Given** catálogo de dicas pré-aprovadas, **When** job semanal executa, **Then** envia no máximo 1 dica por usuário por semana com deep link configurado
- [ ] **Given** endpoint interno `POST /notifications/campaigns`, **When** operador envia título, corpo e segmento, **Then** dispara push para usuários elegíveis (preferência ativa + token válido)
- [ ] **Given** campanha enviada, **When** concluída, **Then** registra id, timestamp e contagem de envios para auditoria
- [ ] **Given** conteúdo não pré-aprovado, **When** tentativa de dica dinâmica LLM, **Then** rejeitada (apenas conteúdo curado)

## Technical Notes

- Dicas em arquivo YAML/JSON ou tabela seed no backend
- Campanha: auth interno (service key ou role admin futuro)
- Segmento MVP: `all_active` ou lista de firebaseUids

## Dependencies

### Requires
- 003-fcm-push-provider

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Segmento vazio | Retorna 0 envios; não erro |
| Campanha duplicada mesmo dia | Idempotência por campaignId |

## Out of Scope

- Painel admin web
- A/B testing de mensagens
