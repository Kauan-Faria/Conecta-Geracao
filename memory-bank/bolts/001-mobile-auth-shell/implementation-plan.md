---
stage: plan
bolt: 001-mobile-auth-shell
created: 2026-06-01T12:00:00Z
---

## Implementation Plan: 001-mobile-auth-shell

### Objective

Criar a fundação do app Flutter em `apps/mobile/`: autenticação Google via Firebase, shell de navegação com guard de rotas e preferências de acessibilidade persistidas localmente — permitindo que o usuário autenticado navegue no app com tema acessível configurável.

### Deliverables

- [ ] Projeto Flutter inicializado em `apps/mobile/` com estrutura feature-based
- [ ] Login com Google (Firebase Auth) com mensagens de erro em português
- [ ] Sessão persistente — reabrir app mantém usuário logado
- [ ] Shell de navegação: Início, Chat (placeholder), Configurações
- [ ] Redirect automático: não autenticado → login; autenticado → home
- [ ] Tela de Configurações com prefs de acessibilidade (fonte, alto contraste, densidade reduzida)
- [ ] Tema dinâmico via `ThemeExtension` + Riverpod aplicado em todo o app
- [ ] Persistência local de preferências (SharedPreferences)
- [ ] Widgets base acessíveis (`AppButton`, `AppScaffold`) com alvos ≥ 48dp e `Semantics`
- [ ] Esqueleto de `ApiClient` preparado para enviar ID token (uso futuro pela API)

### Dependencies

- **Firebase Auth (Google)**: login social — projeto Firebase precisa estar configurado com SHA-1/SHA-256 (Android) e GoogleService-Info.plist (iOS)
- **firebase_core + firebase_auth + google_sign_in**: SDKs Flutter
- **flutter_riverpod**: gerenciamento de estado (auth, tema, prefs)
- **go_router**: navegação declarativa com redirect baseado em auth
- **shared_preferences**: persistência de preferências não sensíveis
- **flutter_lints**: linting padrão do projeto

### Technical Approach

#### 1. Estrutura do projeto

```text
apps/mobile/
  lib/
    main.dart
    app.dart                    # MaterialApp + ProviderScope + router
    core/
      theme/
        app_colors.dart
        app_spacing.dart
        app_typography.dart
        app_theme.dart            # ThemeData + ThemeExtension
        accessibility_extension.dart
      routing/
        app_router.dart           # GoRouter + auth redirect
      network/
        api_client.dart           # esqueleto com Bearer token
      widgets/
        app_button.dart
        app_scaffold.dart
    features/
      auth/
        data/
          auth_repository.dart
        domain/
          app_user.dart
        presentation/
          login_page.dart
          auth_controller.dart    # Riverpod Notifier
      shell/
        presentation/
          app_shell.dart          # BottomNavigationBar ou NavigationRail simplificado
          home_page.dart
          chat_placeholder_page.dart
          settings_page.dart
      accessibility/
        data/
          accessibility_prefs_repository.dart
        domain/
          accessibility_prefs.dart
        presentation/
          accessibility_controller.dart
          settings_accessibility_section.dart
  test/
    features/
      auth/
      accessibility/
      shell/
```

#### 2. Story 001 — Login com Google

- `AuthRepository` encapsula Firebase Auth + Google Sign-In
- `AuthController` (Riverpod) expõe `AsyncValue<AppUser?>` e métodos `signInWithGoogle()` / `signOut()`
- `LoginPage`: botão "Entrar com Google" com `Semantics`, loading state e mensagens amigáveis
- Tratamento de erros: cancelamento (silencioso), sem internet, falha genérica — textos em português
- Stream de `authStateChanges()` para sessão persistente
- `ApiClient` recebe callback/provider do ID token para headers futuros

#### 3. Story 002 — Shell e navegação

- `GoRouter` com rotas: `/login`, `/home`, `/chat`, `/settings`
- Redirect: `!isAuthenticated && !isLoginRoute → /login`; `isAuthenticated && isLoginRoute → /home`
- `AppShell`: scaffold compartilhado com bottom nav (Início, Chat, Configurações)
- Placeholder no Chat ("Em breve") — escopo do bolt 006
- Portrait only via `SystemChrome.setPreferredOrientations`
- Alvos de toque ≥ 48dp; ícones com rótulo textual via `Semantics` ou `NavigationDestination`

#### 4. Story 003 — Preferências de acessibilidade

- Modelo `AccessibilityPrefs`: `fontScale` (normal/grande/extra grande), `highContrast`, `reducedDensity`
- `AccessibilityPrefsRepository`: load/save via SharedPreferences
- `AccessibilityController`: Riverpod Notifier; aplica prefs imediatamente ao alterar
- `ThemeExtension` (`AccessibilityTheme`) mapeia prefs → cores, tipografia e spacing
- Respeitar `MediaQuery.textScaler` do sistema como baseline
- `SettingsPage` com controles acessíveis (SegmentedButton ou RadioListTile com labels claros)

#### 5. Acessibilidade transversal

- WCAG 2.1 AA: contraste, fonte ajustável, alvos ≥ 48dp
- `Semantics` em botões, imagens e campos interativos
- Testes manuais TalkBack/VoiceOver documentados no Stage 3

### Acceptance Criteria

- [ ] **Login Google**: usuário não logado toca "Entrar com Google", completa OAuth e vê tela inicial
- [ ] **Erro de login**: mensagem simples em português ao falhar (incl. sem internet)
- [ ] **Sessão persistente**: reabrir app mantém autenticação sem novo login
- [ ] **Cancelamento Google**: retorna à tela de login sem erro técnico
- [ ] **Navegação**: usuário logado vê Início/Chat/Configurações; não logado vai ao login
- [ ] **Alvos de toque**: menu de navegação com alvos ≥ 48dp e rótulos textuais
- [ ] **Fonte ajustável**: escolher tamanho em Configurações atualiza todo o app imediatamente
- [ ] **Alto contraste**: cores seguem modo alto contraste ao navegar
- [ ] **Persistência prefs**: fechar e reabrir app mantém preferências
- [ ] **Lint**: `flutter analyze` sem erros
- [ ] **Testes**: widget tests nos fluxos críticos (login redirect, prefs persistence mock)

### Out of Scope (deste bolt)

- Integração real com API NestJS (apenas esqueleto de `ApiClient`)
- Tela de chat funcional (placeholder)
- Outros provedores de login
- Layout tablet dedicado
- Perfil de cuidador

### Risks & Mitigations

| Risco | Mitigação |
|-------|-----------|
| Firebase não configurado no projeto | Documentar passos de setup; usar `--dart-define` ou `firebase_options.dart` gerado pelo FlutterFire CLI |
| Testes de Google Sign-In em CI | Mock de `AuthRepository` nos widget tests; testes E2E manuais no dispositivo |
| iOS/Android config divergente | Checklist de setup por plataforma no walkthrough |

### Implementation Order

1. Scaffold Flutter + dependências + tema base
2. Auth (login, sessão, redirect)
3. Shell de navegação
4. Preferências de acessibilidade + persistência
5. Widgets base + polish de acessibilidade
6. Testes + lint
