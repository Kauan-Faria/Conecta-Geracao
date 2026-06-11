---
stage: plan
bolt: 019-push-notifications-ui
created: 2026-06-10T12:00:00Z
---

## Implementation Plan: Push Notifications UI (Bolt 019)

### Objective

Integrar `firebase_messaging` no app Flutter para obter token FCM, solicitar permissão de forma contextual (após valor percebido no chat) e sincronizar o token com a API de notificações (`PUT/DELETE /api/v1/notifications/device-token`), incluindo cleanup no logout.

### Deliverables

- [x] Dependência `firebase_messaging` no `pubspec.yaml`
- [x] Feature `apps/mobile/lib/features/notifications/` com camadas data/domain/presentation
- [x] Background handler top-level + inicialização FCM no bootstrap do app
- [x] Serviço de permissão contextual com diálogo pre-permission (Material 3, linguagem simples)
- [x] `NotificationsApi` + `NotificationsRepository` para sync token com backend
- [x] Integração no fluxo de logout (`AuthController.signOut`)
- [x] Trigger contextual após primeira resposta da IA no chat (usuário autenticado, não guest)
- [x] Extensão do `ApiClient` com métodos `put` e `delete`
- [x] Config nativa mínima (Android POST_NOTIFICATIONS, iOS UIBackgroundModes)
- [x] Testes unitários dos componentes testáveis (repository, permission state, platform detection)

### Dependencies

- **016-notifications-api** (✅ complete): Endpoints `PUT/DELETE /notifications/device-token` com auth Firebase
- **001-mobile-auth-shell**: `ApiClient`, `AuthController`, `FirebaseAuthRepository.getIdToken()`
- **firebase_core** (existente): Reutilizar `firebase_options.dart`
- **Backend global prefix**: `/api/v1` → paths client: `/api/v1/notifications/device-token`

### Technical Approach

#### 1. Estrutura da feature

```text
apps/mobile/lib/features/notifications/
  data/
    notifications_api.dart          # PUT/DELETE device-token
    notifications_repository.dart   # sync, deactivate, retry queue
    notification_prefs_repository.dart  # SharedPreferences flags
  domain/
    device_platform.dart            # ios | android
    notification_analytics.dart     # eventos locais (debugPrint em dev)
  presentation/
    notification_permission_controller.dart  # Riverpod — estado + fluxo
    notification_permission_dialog.dart    # pre-permission UI
    notifications_bootstrap.dart           # init FCM, listeners
  firebase_messaging_background.dart       # top-level @pragma handler
```

#### 2. Story 001 — FCM SDK Integration

1. Adicionar `firebase_messaging` ao pubspec
2. Criar `firebase_messaging_background.dart` com handler top-level registrado em `main.dart` **antes** de `runApp`
3. `NotificationsBootstrap.initialize()`:
   - `FirebaseMessaging.instance.requestPermission()` **não** chamado no startup (story 002)
   - Obter token apenas se permissão já concedida (degradação graciosa se falhar)
   - `onTokenRefresh` → delegar ao repository para re-sync
   - `onBackgroundMessage` handler processa payload `data`
   - `getInitialMessage()` capturado e armazenado para bolt 020 (deep links)
   - `onMessageOpenedApp` listener registrado (stub para bolt 020)
4. Android: permissão `POST_NOTIFICATIONS` no manifest (API 33+)
5. iOS: `UIBackgroundModes` → `remote-notification` no Info.plist; APNs documentado como passo manual no Firebase Console

#### 3. Story 002 — Contextual Permission Prompt

1. **Trigger**: Após `ChatController` receber primeira mensagem `MessageRole.assistant` em conversa autenticada (não guest)
2. **Estado persistido** (`NotificationPrefsRepository`):
   - `permissionPromptShownEver` — evita spam entre sessões se negado permanentemente
   - `permissionPromptShownThisSession` — máx. 1x por sessão
3. **Fluxo**:
   - Se OS já concedeu → pular diálogo, ir direto ao registro token
   - Senão → exibir `NotificationPermissionDialog` (texto simples, alvos ≥ 48dp, Semantics)
   - Aceitar → `requestPermission()` nativo → emitir `notification_permission_granted` ou `_denied`
   - Recusar → emitir `notification_permission_denied`, app continua normal
4. Diálogo apresentado via callback/`ref.read` a partir do chat — sem prompt na primeira abertura

#### 4. Story 003 — Token Sync & Logout

1. `NotificationsApi`:
   - `PUT /api/v1/notifications/device-token` body: `{ token, platform: 'ios'|'android' }`
   - `DELETE /api/v1/notifications/device-token` body: `{ token }`
2. `NotificationsRepository.syncToken()`:
   - Só executa se usuário autenticado (não guest) e permissão concedida
   - Retry com backoff exponencial (3 tentativas) em falha de rede
   - Ignora 401 silenciosamente (aguarda re-login)
   - Emite `notification_token_registered` em sucesso
3. `AuthController.signOut()`:
   - Chamar `deactivateCurrentToken()` **antes** de `authRepository.signOut()`
4. `onTokenRefresh` re-sincroniza automaticamente
5. Offline: guardar token pendente em SharedPreferences; sync na próxima conexão via `ConnectivityService`

#### 5. Alterações transversais

| Arquivo | Mudança |
|---------|---------|
| `main.dart` | Registrar background handler; chamar bootstrap pós-Firebase init |
| `api_client.dart` | Adicionar `put()` e `delete()` |
| `auth_controller.dart` | Deactivate token no signOut |
| `chat_controller.dart` | Hook pós-resposta IA → permission controller |
| `app.dart` | Provider/listener de bootstrap notifications |

#### 6. Fora de escopo deste bolt (bolt 020)

- Toggle nas configurações
- Banner foreground
- Deep link navigation
- Firebase Analytics formal (usar `NotificationAnalytics` com debugPrint; integração completa no bolt 020)

### Acceptance Criteria

- [ ] **FCM token** obtido sem crash em iOS/Android quando permissão concedida; app continua se falhar
- [ ] **Background handler** processa payload `data` sem crash
- [ ] **Cold start** via notificação captura `initialMessage`
- [ ] **Primeira abertura** não exibe prompt de notificação
- [ ] **Após resposta IA** no chat autenticado, exibe diálogo contextual (máx. 1x/sessão)
- [ ] **Permissão concedida** → `PUT device-token` com Bearer; emite evento de registro
- [ ] **Token refresh** → re-sync automático
- [ ] **Logout** → `DELETE device-token` antes de limpar sessão
- [ ] **Guest** → nunca registra token
- [ ] **Testes** unitários passando; lint ok

### Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| APNs não configurado no Firebase (iOS) | Documentar no walkthrough; degradação graciosa |
| Dispositivo sem Google Play Services | Capturar exceção; log amigável; sem push |
| ApiClient sem PUT/DELETE | Estender neste bolt |

### Ordem de implementação (Stage 2)

1. ApiClient + NotificationsApi
2. Domain + data layer (repository, prefs)
3. FCM bootstrap + background handler + main.dart
4. Permission controller + dialog
5. Integração chat + auth logout
6. Testes unitários
7. `implementation-walkthrough.md`
