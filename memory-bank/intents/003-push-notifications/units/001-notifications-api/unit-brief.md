---
unit: 001-notifications-api
intent: 003-push-notifications
phase: inception
status: complete
created: 2026-06-08T23:30:00Z
updated: 2026-06-10T22:20:00Z
---

# Unit Brief: Notifications API

## Purpose

Módulo backend NestJS (`NotificationsModule`) responsável por registrar tokens FCM, gerenciar preferências de notificação, enviar push via `PushNotificationProvider` (FCM Admin SDK) e orquestrar triggers automáticos (lembrete de conversa, resposta IA, dicas, campanhas).

## Scope

### In Scope
- Entidades `DeviceToken`, `NotificationPreference`
- Port `PushNotificationProvider` → implementação FCM Admin SDK
- Endpoints autenticados: registrar token, atualizar preferência
- Inativação de token no logout (via endpoint ou evento)
- Jobs: conversa abandonada, dicas educativas
- Trigger: resposta IA em background
- API interna para campanhas administrativas
- Evento `notification_sent` no backend

### Out of Scope
- UI mobile (Flutter)
- Painel administrativo web
- Categorias configuráveis de notificação
- Push para usuários convidados (guest)
- Rich media notifications

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-3 | Registro e gestão de token FCM | Must |
| FR-4 | Preferência geral (backend) | Must |
| FR-5 | Lembrete conversa abandonada | Must |
| FR-6 | Notificação resposta IA em background | Must |
| FR-7 | Dicas educativas periódicas | Should |
| FR-8 | Campanhas administrativas | Should |
| FR-10 | `notification_sent` analytics | Must |

---

## Domain Concepts

### Key Entities

| Entity | Description | Attributes |
|--------|-------------|------------|
| DeviceToken | Token FCM do dispositivo | id, firebaseUid, token, platform, isActive, lastSeenAt |
| NotificationPreference | Opt-in do usuário | firebaseUid, enabled, updatedAt |
| PushNotification | Mensagem a enviar | type, title, body, deepLink, conversationId? |
| NotificationType | Tipo de notificação | enum: reminder, ai_response, tip, campaign |

### Key Operations

| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| registerDeviceToken | Persiste/atualiza token | firebaseUid, token, platform | DeviceToken |
| updatePreference | Ativa/desativa notificações | firebaseUid, enabled | NotificationPreference |
| deactivateToken | Inativa token no logout | firebaseUid, token | void |
| sendPush | Envia via FCM | firebaseUid, PushNotification | sendResult |
| findAbandonedConversations | Job lembrete | inactivityHours | conversation[] |
| sendCampaign | Campanha admin | segment, PushNotification | count |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 6 |
| Must Have | 4 |
| Should Have | 2 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-notifications-domain-model | Domínio DeviceToken + Preference | Must | Complete |
| 002-token-preference-api | API registro token e preferência | Must | Complete |
| 003-fcm-push-provider | PushNotificationProvider FCM | Must | Complete |
| 004-conversation-notification-triggers | Lembretes e resposta IA | Must | Complete |
| 005-tips-and-campaigns | Dicas e campanhas admin | Should | Complete |
| 006-notification-sent-analytics | Evento notification_sent | Must | Complete |

---

## Dependencies

### Depends On

| Unit | Reason |
|------|--------|
| 001-mobile-auth-shell | Auth Firebase para endpoints |
| 003-ai-assistant-api | Conversas para triggers FR-5/FR-6 |

### Depended By

| Unit | Reason |
|------|--------|
| 002-push-notifications-ui | Consome API de token/preferência |

### External Dependencies

| System | Purpose | Risk |
|--------|---------|------|
| Firebase Admin SDK | Envio FCM | Médio |
| PostgreSQL | Persistência token/preferência | Baixo |

---

## Technical Context

### Suggested Technology
- NestJS module `notifications` com DDD (domain/application/infrastructure)
- Prisma models: `DeviceToken`, `NotificationPreference`
- `@nestjs/schedule` ou job queue leve para lembretes/dicas
- FCM HTTP v1 via `firebase-admin` messaging

### Integration Points

| Integration | Type | Protocol |
|-------------|------|----------|
| Flutter app | REST API | JSON/HTTPS |
| conversations module | Internal event/service | NestJS DI |
| Firebase FCM | External | Admin SDK |

---

## Constraints

- Payload FCM sem dados sensíveis ou conteúdo pessoal completo
- Respeitar `NotificationPreference.enabled` em todo envio
- Token inativado no logout

---

## Success Criteria

### Functional
- [x] Token registrado e vinculado ao firebaseUid
- [x] Envio bloqueado quando preferência desativada
- [x] Lembrete de conversa abandonada entregue com deep link
- [x] Campanha interna enviada para segmento

### Non-Functional
- [x] p95 registro token < 500ms (validado em testes)
- [ ] p95 envio FCM < 5s (manual pós-deploy com `FCM_ENABLED=true`)
- [x] Tokens inválidos marcados inativos após erro permanente FCM

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 016-notifications-api | DDD | 001, 002 | Domínio + API token/preferência |
| 017-notifications-api | DDD | 003, 004 | FCM provider + triggers conversa |
| 018-notifications-api | DDD | 005, 006 | Dicas/campanhas + analytics |
