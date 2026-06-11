---
stage: implement
bolt: 019-push-notifications-ui
created: 2026-06-10T13:00:00Z
---

## Implementation Walkthrough: Push Notifications UI (Bolt 019)

### Summary

Integração FCM no app Flutter com bootstrap no startup, prompt contextual após a primeira resposta da IA no chat, sincronização de token com a API de notificações e remoção no logout. A feature segue a organização por camadas já usada no mobile (data/domain/presentation) com Riverpod.

### Structure Overview

A feature `notifications` concentra cliente FCM, repositório de sync, preferências locais e fluxo de permissão. O bootstrap inicializa listeners FCM no `ConectaGeracaoApp`. Um host global exibe o diálogo de permissão quando o controller sinaliza. O chat dispara o prompt após a primeira resposta do assistente para usuários autenticados.

### Completed Work

- [x] `apps/mobile/pubspec.yaml` — dependência `firebase_messaging`
- [x] `apps/mobile/lib/core/network/api_client.dart` — métodos `put` e `delete`
- [x] `apps/mobile/lib/main.dart` — registro do background handler FCM
- [x] `apps/mobile/lib/app.dart` — bootstrap e `NotificationPermissionHost`
- [x] `apps/mobile/lib/features/notifications/firebase_messaging_background.dart` — handler top-level
- [x] `apps/mobile/lib/features/notifications/domain/device_platform.dart` — detecção ios/android
- [x] `apps/mobile/lib/features/notifications/domain/notification_analytics.dart` — eventos locais
- [x] `apps/mobile/lib/features/notifications/data/notification_prefs_repository.dart` — prefs de token e permissão
- [x] `apps/mobile/lib/features/notifications/data/notifications_api.dart` — port + client REST
- [x] `apps/mobile/lib/features/notifications/data/push_messaging_client.dart` — adapter Firebase Messaging
- [x] `apps/mobile/lib/features/notifications/data/notifications_repository.dart` — sync, retry, logout, listeners
- [x] `apps/mobile/lib/features/notifications/presentation/notifications_providers.dart` — providers Riverpod
- [x] `apps/mobile/lib/features/notifications/presentation/notifications_bootstrap.dart` — init no app start
- [x] `apps/mobile/lib/features/notifications/presentation/notification_permission_controller.dart` — fluxo contextual
- [x] `apps/mobile/lib/features/notifications/presentation/notification_permission_dialog.dart` — diálogo pre-permission
- [x] `apps/mobile/lib/features/notifications/presentation/notification_permission_host.dart` — exibição global do diálogo
- [x] `apps/mobile/lib/features/auth/presentation/auth_controller.dart` — deactivate token no signOut
- [x] `apps/mobile/lib/features/chat/presentation/chat_controller.dart` — trigger após resposta IA
- [x] `apps/mobile/android/app/src/main/AndroidManifest.xml` — permissão POST_NOTIFICATIONS
- [x] `apps/mobile/ios/Runner/Info.plist` — UIBackgroundModes remote-notification

### Key Decisions

- **Port `NotificationsRemotePort`**: permite testar o repositório sem HTTP real, alinhado ao padrão hexagonal do backend.
- **Prompt via host global**: evita acoplar `BuildContext` ao `ChatController`; o chat apenas sinaliza o controller.
- **Sync condicionado**: token só é enviado para usuário autenticado não-guest com permissão OS concedida.
- **Analytics via debugPrint**: eventos registrados localmente; integração Firebase Analytics fica para o bolt 020.

### Deviations from Plan

- `initialMessage` e deep links ficam armazenados/capturados no repositório, mas navegação será implementada no bolt 020.
- Foreground banner não incluído neste bolt (escopo do 020).

### Dependencies Added

- [x] `firebase_messaging` — recebimento de push e token FCM

### Developer Notes

- Configurar APNs no Firebase Console para push em iOS (dispositivo físico).
- Testar permissão e registro de token em dispositivo real; emulador Android pode não entregar push.
- `pendingInitialMessage` no repositório será consumido pelo bolt 020 para deep links.
