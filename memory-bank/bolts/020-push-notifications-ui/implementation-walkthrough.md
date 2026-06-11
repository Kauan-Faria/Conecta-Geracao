---
stage: implement
bolt: 020-push-notifications-ui
created: 2026-06-10T23:30:00Z
---

## Implementation Walkthrough: Push Notifications UI (Bolt 020)

### Summary

UX completa de notificações no Flutter: toggle de preferência nas configurações, banner acessível em foreground, deep links ao tocar notificação (incluindo cold start) e eventos de analytics client-side sem PII. Construído sobre a base FCM do bolt 019.

### Structure Overview

A camada de navegação (`NotificationNavigationCoordinator` + `NotificationDeepLinkHandler`) interpreta payloads FCM e aciona o GoRouter. O banner foreground é exibido por um host global no `MaterialApp.builder`. Preferências do usuário ficam em controller Riverpod dedicado, integrado à `SettingsPage`.

### Completed Work

- [x] `apps/mobile/lib/features/notifications/domain/notification_deep_link.dart` — parser de payload FCM → rotas internas
- [x] `apps/mobile/lib/features/notifications/domain/notification_analytics.dart` — evento `notification_opened`
- [x] `apps/mobile/lib/features/notifications/data/notifications_api.dart` — GET/PUT preferences
- [x] `apps/mobile/lib/features/notifications/data/notifications_repository.dart` — callbacks foreground/opened e título/corpo da notificação
- [x] `apps/mobile/lib/features/notifications/presentation/notification_preference_controller.dart` — toggle com sync backend e permissão OS
- [x] `apps/mobile/lib/features/notifications/presentation/settings_notifications_section.dart` — UI do toggle em configurações
- [x] `apps/mobile/lib/features/notifications/presentation/notification_deep_link_handler.dart` — navegação + analytics
- [x] `apps/mobile/lib/features/notifications/presentation/notification_navigation_coordinator.dart` — cold start, auth pendente, banner
- [x] `apps/mobile/lib/features/notifications/presentation/foreground_notification_banner.dart` — MaterialBanner acessível
- [x] `apps/mobile/lib/features/notifications/presentation/notifications_bootstrap.dart` — ordem de init ajustada
- [x] `apps/mobile/lib/features/notifications/presentation/notification_permission_controller.dart` — fluxo de permissão a partir das configurações
- [x] `apps/mobile/lib/app.dart` — host do banner foreground
- [x] `apps/mobile/lib/features/shell/presentation/shell_pages.dart` — seção de notificações
- [x] `apps/mobile/test/features/notifications/notification_deep_link_test.dart`
- [x] `apps/mobile/test/features/notifications/notification_preference_controller_test.dart`
- [x] `apps/mobile/test/features/notifications/notification_analytics_test.dart`

### Key Decisions

- **Parser alinhado ao backend**: campo `route` contém path completo (`/conversations/{id}`), mapeado para `/chat?conversationId=...`.
- **Analytics via debugPrint**: sem Firebase Analytics SDK no pubspec; eventos estruturados sem PII (apenas type + route normalizado).
- **Permissão via diálogo existente**: toggle ON sem permissão OS reutiliza o fluxo contextual do bolt 019.
- **MaterialBanner global**: substitui banner anterior em bursts; auto-dismiss em 5s.

### Deviations from Plan

- Nenhuma.

### Dependencies Added

- Nenhuma nova dependência de pacote.

### Developer Notes

- Testar deep link em dispositivo real: cold start via push → auth → navegação automática.
- Payload inválido redireciona para `/home` com SnackBar amigável.
- Guest não vê toggle de notificações (oculto na seção).
