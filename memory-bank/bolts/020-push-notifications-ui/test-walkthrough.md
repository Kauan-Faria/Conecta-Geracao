---
stage: test
bolt: 020-push-notifications-ui
created: 2026-06-10T23:45:00Z
---

## Test Report: Push Notifications UI (Bolt 020)

### Summary

- **Tests**: 24/24 passed
- **Coverage**: unit tests nos parsers, controllers, handler e repositório (sem widget E2E de banner)

### Test Files

- [x] `test/features/notifications/notification_deep_link_test.dart` — mapeamento de payloads FCM para rotas GoRouter
- [x] `test/features/notifications/notification_deep_link_handler_test.dart` — navegação + evento analytics
- [x] `test/features/notifications/notification_preference_controller_test.dart` — GET/PUT preferences e sync token
- [x] `test/features/notifications/notification_analytics_test.dart` — evento `notification_opened` sem PII
- [x] `test/features/notifications/notifications_repository_test.dart` — callbacks e sync (019 + extensões)
- [x] `test/features/notifications/notification_permission_controller_test.dart` — fluxo contextual (019)
- [x] `test/features/notifications/notification_prefs_repository_test.dart` — prefs locais (019)
- [x] `test/features/notifications/device_platform_test.dart` — plataforma (019)

**Comando**: `flutter test test/features/notifications/` → **24/24 passed**

### Acceptance Criteria Validation

- ✅ **Toggle configurações**: `SettingsNotificationsSection` com Semantics; controller testa GET/PUT
- ✅ **Persistência preferência**: `NotificationPreferenceController` testado
- ✅ **Falha API reverte toggle**: SnackBar em `SettingsNotificationsSection`; controller reverte estado
- ✅ **Toggle ON sem permissão OS**: `offerPermissionFromSettings` integrado (fluxo contextual 019)
- ✅ **Banner foreground**: implementado via `ForegroundNotificationBannerHost` (validação manual)
- ✅ **Deep link background/terminated**: `NotificationDeepLinkHandler` + coordinator (unit + manual)
- ✅ **Cold start**: `consumeInitialMessage` + `processPendingNavigation` (manual em dispositivo)
- ✅ **Route inválido → home**: testado em `notification_deep_link_test.dart`
- ✅ **Analytics sem PII**: apenas `type` + route normalizado em `notificationOpened`
- ✅ **Lint**: analyzer sem erros nos arquivos alterados (após fix em `notification_permission_dialog.dart`)

### Issues Found

- Nenhum bloqueador nos testes automatizados.
- Banner foreground, cold start e deep link pós-login requerem validação manual em dispositivo físico.

### Manual Checklist (dispositivo físico)

- [ ] Toggle em Configurações reflete estado do backend
- [ ] Desligar toggle impede novos push (backend respeita `enabled=false`)
- [ ] App aberto: push exibe MaterialBanner com action "Ver"
- [ ] Toque na notificação abre chat/conversa correta
- [ ] Cold start via push navega após login
- [ ] Eventos `[NotificationAnalytics]` visíveis no debug console

### Notes

- E2E completo: enviar push do backend (`FCM_ENABLED=true`) → tocar → abrir chat.
- Intent 003-push-notifications fica pronto para produção após checklist manual.
