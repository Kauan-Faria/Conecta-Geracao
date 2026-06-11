---
stage: test
bolt: 019-push-notifications-ui
status: complete
created: 2026-06-10T22:20:00Z
---

# Test Walkthrough: Push Notifications UI (Bolt 019)

## Summary

- **Flutter unit tests**: 12/12 passed (`test/features/notifications/`)
- **Manual E2E**: recomendado em dispositivo físico (APNs iOS, token FCM real)

## Story Validation

### 001-fcm-sdk-integration

- ✅ `firebase_messaging` no pubspec
- ✅ Background handler registrado em `main.dart` antes de `runApp`
- ✅ `NotificationsBootstrap` inicializa listeners sem pedir permissão no startup
- ✅ Android `POST_NOTIFICATIONS` + iOS `UIBackgroundModes` configurados

### 002-contextual-permission-prompt

- ✅ Prompt disparado após primeira resposta IA no chat (usuário autenticado, não guest)
- ✅ `NotificationPrefsRepository` evita spam entre sessões
- ✅ Diálogo pre-permission com linguagem simples e alvos acessíveis
- ✅ App continua funcional se permissão negada

### 003-token-sync-logout

- ✅ `PUT /api/v1/notifications/device-token` após permissão concedida
- ✅ `DELETE` no logout via `AuthController.signOut`
- ✅ `onTokenRefresh` re-sincroniza token
- ✅ Sync condicionado: autenticado + não-guest + permissão OS

## Unit Tests

| Arquivo | Foco |
|---------|------|
| `notifications_repository_test.dart` | sync token, deactivate, retry |
| `notification_permission_controller_test.dart` | fluxo contextual, estados |
| `notification_prefs_repository_test.dart` | flags de permissão e token |
| `device_platform_test.dart` | detecção ios/android |

**Comando**: `flutter test test/features/notifications/` → **12/12 passed**

## Manual Checklist (dispositivo físico)

- [ ] Permissão solicitada apenas após valor percebido no chat
- [ ] Token registrado no backend (verificar tabela `device_tokens`)
- [ ] Logout remove/desativa token
- [ ] Push recebido com `FCM_ENABLED=true` no backend (bolt 017+)

## Out of Scope (bolt 020)

- Banner foreground
- Deep link navigation ao tocar notificação
- Toggle nas configurações
- Firebase Analytics client-side
