---
intent: 003-push-notifications
phase: inception
status: units-decomposed
created: 2026-06-08T23:30:00Z
updated: 2026-06-08T23:30:00Z
---

# Notificações push — Unit Decomposition

## Requirement-to-Unit Mapping

| FR | Requirement | Unit |
|----|-------------|------|
| FR-1 | Integração FCM no Flutter (background + foreground) | `002-push-notifications-ui` |
| FR-2 | Permissão contextual (não na primeira abertura) | `002-push-notifications-ui` |
| FR-3 | Registro e gestão de token FCM | `001-notifications-api` + `002-push-notifications-ui` |
| FR-4 | Preferência geral de notificações | `001-notifications-api` + `002-push-notifications-ui` |
| FR-5 | Lembrete de conversa abandonada | `001-notifications-api` |
| FR-6 | Notificação resposta IA em background | `001-notifications-api` |
| FR-7 | Dicas educativas periódicas | `001-notifications-api` |
| FR-8 | Campanhas administrativas (backend) | `001-notifications-api` |
| FR-9 | Deep link ao tocar notificação | `002-push-notifications-ui` |
| FR-10 | Eventos de analytics | `001-notifications-api` + `002-push-notifications-ui` |

## Units Overview

Este intent decompõe em **2 units**:

### Unit 1: `001-notifications-api`

**Description**: Módulo backend NestJS — `NotificationsModule` com `DeviceToken`, `NotificationPreference`, `PushNotificationProvider` (FCM Admin SDK), jobs de lembrete/dicas e API de campanhas.

**Stories**: 6 | **Complexity**: M | **Priority**: Must

**Deliverables**: Endpoints de token/preferência, envio FCM, triggers de conversa, campanhas internas, eventos `notification_sent`.

**Dependencies**: `001-mobile-auth-shell`, `003-ai-assistant-api` (conversations)

---

### Unit 2: `002-push-notifications-ui`

**Description**: UI mobile Flutter — `firebase_messaging`, permissão contextual, sync de token, toggle nas configurações, banner foreground e deep links.

**Stories**: 7 | **Complexity**: M | **Priority**: Must

**Deliverables**: Integração FCM end-to-end no app, UX de consentimento, navegação por deep link, eventos client-side do funil.

**Dependencies**: `001-notifications-api`, shell existente (`001-mobile-auth-shell`), chat UI (`004-digital-guidance-ui`)

## Unit Dependency Graph

```text
001-mobile-auth-shell (intent 001)
         │
         ▼
003-ai-assistant-api (intent 001) ──► 001-notifications-api ──► 002-push-notifications-ui
         │                                      ▲
004-digital-guidance-ui (intent 001) ──────────┘
```

## Execution Order

1. **Bolt 016–018**: `001-notifications-api` (domínio, FCM, triggers, campanhas)
2. **Bolt 019–020**: `002-push-notifications-ui` (FCM client, UX, deep links)

**Nota**: Executar somente após auth, chat e maps estáveis (bolts 001–015 concluídos ou estáveis).
