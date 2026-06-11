---
unit: 002-push-notifications-ui
intent: 003-push-notifications
phase: inception
status: complete
unit_type: frontend
default_bolt_type: simple-construction-bolt
created: 2026-06-08T23:30:00Z
updated: 2026-06-10T22:20:00Z
---

# Unit Brief: Push Notifications UI

## Purpose

Integração Flutter com `firebase_messaging`: permissão contextual, sincronização de token com backend, toggle nas configurações, banner in-app em foreground, deep links e eventos de analytics do funil no cliente.

## Scope

### In Scope
- `firebase_messaging` setup (iOS/Android)
- Handlers background e foreground
- Prompt de permissão contextual (não na primeira abertura)
- Sync token com API + remoção no logout
- Toggle "Receber notificações" nas configurações
- Banner in-app simples em foreground
- Deep link interno ao tocar notificação
- Eventos: permission_granted/denied, token_registered, notification_opened

### Out of Scope
- Categorias configuráveis de notificação
- Push para convidados (guest)
- Rich media / action buttons
- Painel admin

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Integração FCM Flutter | Must |
| FR-2 | Permissão contextual | Must |
| FR-3 | Registro token (cliente) | Must |
| FR-4 | Toggle preferência (UI) | Must |
| FR-9 | Deep link | Must |
| FR-10 | Eventos analytics client | Must |

---

## Domain Concepts

### Key Flows

| Flow | Description |
|------|-------------|
| PermissionContextual | Após valor percebido → diálogo → consentimento |
| TokenLifecycle | Obter token → POST backend → refresh → DELETE logout |
| NotificationTap | Payload data → router interno → tela destino |
| ForegroundBanner | onMessage → SnackBar/banner acessível |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 7 |
| Must Have | 6 |
| Should Have | 1 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-fcm-sdk-integration | Integração firebase_messaging | Must | Complete |
| 002-contextual-permission-prompt | Permissão após valor percebido | Must | Complete |
| 003-token-sync-logout | Sync token e logout cleanup | Must | Complete |
| 004-notification-settings-toggle | Toggle nas configurações | Must | Planned |
| 005-foreground-in-app-banner | Banner quando app aberto | Must | Planned |
| 006-notification-deep-links | Deep link ao tocar notificação | Must | Planned |
| 007-client-analytics-events | Eventos analytics no app | Should | Planned |

---

## Dependencies

### Depends On

| Unit | Reason |
|------|--------|
| 001-notifications-api | API token/preferência |
| 001-mobile-auth-shell | Auth e logout |
| 004-digital-guidance-ui | Deep link para chat/conversa |

### External Dependencies

| System | Purpose | Risk |
|--------|---------|------|
| firebase_messaging | Receber push | Médio (iOS APNs setup) |
| Firebase project | Mesmo projeto Auth | Baixo |

---

## Technical Context

### Suggested Technology
- `firebase_messaging` + `flutter_local_notifications` (opcional para foreground)
- Riverpod para estado de preferência
- GoRouter ou Navigator 2.0 para deep links
- Firebase Analytics ou logger estruturado para eventos

---

## Constraints

- Não pedir permissão na primeira abertura
- Linguagem simples conforme `ux-guide.md`
- Alvos ≥ 48dp no toggle de configurações

---

## Success Criteria

### Functional
- [ ] Push recebido em background e foreground
- [ ] Permissão pedida após usar chat
- [ ] Toque na notificação abre conversa correta
- [ ] Toggle desativa envios (via API)

### Non-Functional
- [ ] Deep link warm start < 2s
- [ ] TalkBack/VoiceOver no toggle e diálogo de permissão

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 019-push-notifications-ui | simple | 001, 002, 003 | FCM + permissão + token |
| 020-push-notifications-ui | simple | 004, 005, 006, 007 | UX completa + deep links |
