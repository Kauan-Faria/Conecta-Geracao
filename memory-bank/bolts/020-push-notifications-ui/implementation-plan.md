---
stage: plan
bolt: 020-push-notifications-ui
created: 2026-06-10T23:00:00Z
---

## Implementation Plan: Push Notifications UI (Bolt 020)

### Objective

Completar a UX de notificações no app Flutter: toggle de preferência nas configurações, banner acessível em foreground, navegação por deep link ao tocar notificação (cold/warm start) e eventos de analytics client-side sem PII.

### Deliverables

- [ ] `NotificationPreferenceController` + seção na `SettingsPage` com toggle "Receber notificações"
- [ ] Métodos `GET/PUT /api/v1/notifications/preferences` em `NotificationsApi`
- [ ] `NotificationDeepLinkHandler` — parser centralizado de payload FCM → rotas GoRouter
- [ ] `NotificationNavigationCoordinator` — consome `initialMessage`, `onMessageOpenedApp` e toque no banner
- [ ] `ForegroundNotificationBannerHost` — MaterialBanner/SnackBar acessível com action "Ver"
- [ ] Extensão de `NotificationAnalytics` com `notification_opened` (type + route)
- [ ] Testes unitários: deep link parser, preference controller, analytics (sem PII)
- [ ] `implementation-walkthrough.md` e `test-walkthrough.md` (stages 2 e 3)

### Dependencies

- **019-push-notifications-ui** (✅ complete): FCM bootstrap, `NotificationsRepository`, `pendingInitialMessage`, listeners stub
- **017-notifications-api** (✅ complete): push real com payload `data: { type, route, conversationId? }`
- **016-notifications-api** (✅ complete): `GET/PUT /notifications/preferences` com `{ enabled }`
- **004-digital-guidance-ui**: rotas `/chat`, `/home`, `/maps`, `/conversations` no GoRouter

### Payload FCM (backend real)

O backend envia em `data` (via `FcmPushNotificationProvider`):

| Campo | Exemplo | Significado |
|-------|---------|-------------|
| `type` | `ai_response`, `reminder`, `tip`, `campaign` | Tipo para analytics |
| `route` | `/conversations/conv-1`, `/chat?topic=golpes`, `/`, `/maps` | Deep link interno (path + query) |
| `conversationId` | `conv-1` | ID opcional da conversa |

**Nota**: o campo `route` contém o path completo do deep link, não enums `chat`/`home`/`maps`. O handler deve mapear paths do backend para rotas GoRouter existentes.

### Technical Approach

#### 1. Estrutura de arquivos (novos/alterados)

```text
apps/mobile/lib/features/notifications/
  domain/
    notification_deep_link.dart          # parse payload → NotificationTarget
    notification_analytics.dart          # + notificationOpened(type, route)
  data/
    notifications_api.dart               # + get/update preferences
  presentation/
    notification_preference_controller.dart
    settings_notifications_section.dart  # toggle UI (Semantics, ≥48dp)
    notification_deep_link_handler.dart  # navegação via GoRouter
    foreground_notification_banner.dart  # host global de banner
    notifications_providers.dart         # novos providers
  test/features/notifications/
    notification_deep_link_test.dart
    notification_preference_controller_test.dart
    notification_analytics_test.dart

apps/mobile/lib/features/shell/presentation/shell_pages.dart  # import seção
apps/mobile/lib/app.dart                                        # ForegroundNotificationBannerHost
apps/mobile/lib/features/notifications/data/notifications_repository.dart  # wire deep link + banner
```

#### 2. Story 004 — Toggle nas configurações

1. **`NotificationsApi`**:
   - `GET /api/v1/notifications/preferences` → `{ enabled, updatedAt }`
   - `PUT /api/v1/notifications/preferences` body `{ enabled: bool }`
2. **`NotificationPreferenceController`** (Riverpod `AsyncNotifier<bool>`):
   - Carrega preferência ao montar seção (apenas usuário autenticado)
   - Guest: ocultar seção ou mostrar mensagem "Entre para configurar"
   - Ao desligar: `PUT enabled=false`; reverter toggle + SnackBar em falha API
   - Ao ligar sem permissão OS: acionar fluxo existente (`NotificationPermissionController`) e só persistir `enabled=true` após permissão concedida
   - Ao ligar com permissão: `PUT enabled=true` + `syncTokenIfPermitted()`
3. **`SettingsNotificationsSection`**:
   - `SwitchListTile` com `Semantics(label: 'Receber notificações')`, alvo ≥ 48dp
   - Subtítulo explicativo em linguagem simples
   - Estado loading/error com retry

#### 3. Story 005 — Banner foreground

1. **`ForegroundNotificationBannerHost`** no `MaterialApp.builder` (junto ao `NotificationPermissionHost`)
2. **`NotificationsRepository.initializeListeners`** delega `onMessage` para callback registrável (não só log)
3. Exibir `MaterialBanner` ou `SnackBar` com:
   - Título/corpo genéricos ("Nova mensagem" / "Toque para ver")
   - Action "Ver" → mesmo handler de deep link
   - Auto-dismiss após ~5s
   - Contraste WCAG AA via tema existente
4. Múltiplas mensagens rápidas: substituir banner anterior (não empilhar)

#### 4. Story 006 — Deep links

1. **`NotificationDeepLink`** — parser puro testável:

   | Entrada `route` | Navegação GoRouter |
   |-----------------|-------------------|
   | `/conversations/{id}` ou `conversationId` presente | `/chat?conversationId={id}` |
   | `/chat?...` | `/chat?...` (preservar query) |
   | `/`, `/home` | `/home` |
   | `/maps`, `/maps?category=...` | `/maps?...` |
   | inválido/desconhecido | `/home` + SnackBar "Não foi possível abrir" |

2. **`NotificationDeepLinkHandler`**:
   - Recebe `RemoteMessagePayload` + `GoRouter`
   - Emite analytics `notification_opened` após navegação bem-sucedida
3. **`NotificationNavigationCoordinator`**:
   - Após auth gate liberado: processar `pendingInitialMessage` (cold start)
   - Registrar handler em `onMessageOpenedApp` (background → foreground)
   - Integrar com banner foreground (action "Ver")
4. Usuário não autenticado: guardar deep link pendente; executar após login (via `routerRefresh` ou provider dedicado)

#### 5. Story 007 — Analytics client

1. Estender `NotificationAnalytics`:
   - `notificationOpened({ required String type, required String route })`
   - Manter eventos existentes (`permissionGranted`, `permissionDenied`, `tokenRegistered`)
2. Implementação MVP: `debugPrint` estruturado (sem Firebase Analytics SDK — não está no pubspec)
3. Garantir ausência de PII: nunca logar `conversationId`, token ou corpo da mensagem — apenas `type` e route normalizado (`chat`, `home`, `maps`, `unknown`)
4. Chamar eventos nos pontos corretos:
   - Permissão: já no `NotificationPermissionController` (019)
   - Token: já no `NotificationsRepository` (019)
   - Opened: no `NotificationDeepLinkHandler`

#### 6. Alterações transversais

| Arquivo | Mudança |
|---------|---------|
| `app.dart` | Envolver app com `ForegroundNotificationBannerHost` |
| `shell_pages.dart` | Incluir `SettingsNotificationsSection` |
| `notifications_repository.dart` | Callbacks foreground/opened; expor `consumeInitialMessage()` |
| `notifications_bootstrap.dart` | Inicializar navigation coordinator pós-router |

### Acceptance Criteria

- [ ] Toggle "Receber notificações" visível em configurações (autenticado), alvo ≥ 48dp, Semantics
- [ ] Toggle reflete `GET preferences`; alteração persiste via `PUT preferences`
- [ ] Falha API reverte toggle e mostra mensagem amigável
- [ ] Toggle ON sem permissão OS redireciona para fluxo contextual existente
- [ ] App em foreground exibe banner acessível com action "Ver"
- [ ] Toque na notificação (background/terminated) navega para destino correto
- [ ] Cold start via notificação navega após auth check
- [ ] Route inválido → home + mensagem amigável
- [ ] Eventos analytics emitidos sem PII (type + route normalizado)
- [ ] Testes unitários passando; lint ok

### Ordem de implementação (Stage 2)

1. `NotificationsApi` preferences + domain `NotificationDeepLink`
2. `NotificationAnalytics.notificationOpened`
3. `NotificationDeepLinkHandler` + tests
4. `NotificationPreferenceController` + `SettingsNotificationsSection` + tests
5. Wire repository listeners → banner + navigation coordinator
6. `ForegroundNotificationBannerHost` + integração `app.dart`
7. Cold start / auth-pending deep link
8. `implementation-walkthrough.md`

### Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Payload `route` do backend difere das stories (path vs enum) | Parser suporta ambos; testes com payloads reais do FCM provider |
| Deep link antes do router pronto | Coordinator aguarda auth + post-frame callback |
| Guest em settings | Ocultar toggle; CTA login já existe na página |
