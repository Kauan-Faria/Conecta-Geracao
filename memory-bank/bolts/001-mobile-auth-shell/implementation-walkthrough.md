---
stage: implement
bolt: 001-mobile-auth-shell
created: 2026-06-01T14:00:00Z
---

## Implementation Walkthrough: 001-mobile-auth-shell

### Summary

Fundação Flutter criada em `apps/mobile/` com login Google (Firebase Auth), shell de navegação com GoRouter, preferências de acessibilidade persistidas via SharedPreferences e tema dinâmico Material 3. O app inicia na tela de login e redireciona usuários autenticados para o shell principal.

### Structure Overview

Organização feature-based conforme padrões do projeto: `core/` concentra tema, roteamento, cliente HTTP e widgets reutilizáveis; cada feature (`auth`, `shell`, `accessibility`) separa domínio, dados e apresentação. Riverpod gerencia estado de autenticação e preferências; GoRouter aplica redirect baseado no stream de auth.

### Completed Work

- [x] `apps/mobile/` — projeto Flutter inicializado (org: com.conectageracao)
- [x] `apps/mobile/pubspec.yaml` — dependências: Riverpod, GoRouter, Firebase Auth, Google Sign-In, SharedPreferences
- [x] `apps/mobile/lib/firebase_options.dart` — placeholder para FlutterFire configure
- [x] `apps/mobile/lib/main.dart` — bootstrap Firebase, portrait only, SharedPreferences override
- [x] `apps/mobile/lib/app.dart` — MaterialApp.router com tema dinâmico e textScaler
- [x] `apps/mobile/lib/core/theme/app_colors.dart` — paleta padrão e alto contraste
- [x] `apps/mobile/lib/core/theme/app_spacing.dart` — escala de espaçamento e alvo mínimo 48dp
- [x] `apps/mobile/lib/core/theme/app_typography.dart` — tipografia escalável
- [x] `apps/mobile/lib/core/theme/accessibility_extension.dart` — ThemeExtension para prefs
- [x] `apps/mobile/lib/core/theme/app_theme.dart` — ThemeData com modos normal e alto contraste
- [x] `apps/mobile/lib/core/widgets/app_button.dart` — botão acessível com Semantics
- [x] `apps/mobile/lib/core/widgets/app_scaffold.dart` — scaffold com padding adaptável
- [x] `apps/mobile/lib/core/network/api_client.dart` — esqueleto com Bearer token e X-Request-Id
- [x] `apps/mobile/lib/core/routing/app_router.dart` — GoRouter com auth redirect e shell indexado
- [x] `apps/mobile/lib/features/auth/domain/app_user.dart` — entidade de usuário
- [x] `apps/mobile/lib/features/auth/data/auth_repository.dart` — contrato e AuthException
- [x] `apps/mobile/lib/features/auth/data/firebase_auth_repository.dart` — login Google com erros em PT
- [x] `apps/mobile/lib/features/auth/presentation/auth_controller.dart` — providers e ações de auth
- [x] `apps/mobile/lib/features/auth/presentation/login_page.dart` — tela de login
- [x] `apps/mobile/lib/features/shell/presentation/app_shell.dart` — bottom nav Início/Chat/Configurações
- [x] `apps/mobile/lib/features/shell/presentation/shell_pages.dart` — home, chat placeholder, settings
- [x] `apps/mobile/lib/features/accessibility/domain/accessibility_prefs.dart` — modelo de prefs
- [x] `apps/mobile/lib/features/accessibility/data/accessibility_prefs_repository.dart` — persistência local
- [x] `apps/mobile/lib/features/accessibility/presentation/accessibility_controller.dart` — estado Riverpod
- [x] `apps/mobile/lib/features/accessibility/presentation/settings_accessibility_section.dart` — UI de prefs
- [x] `apps/mobile/test/features/accessibility/` — testes de modelo e repositório
- [x] `apps/mobile/test/features/auth/auth_routing_test.dart` — redirect para login
- [x] `apps/mobile/README.md` — setup Firebase e comandos

### Key Decisions

- **initialLocation `/login`**: evita flash da home antes da resolução do auth
- **AuthRepository abstrato**: permite mock nos testes sem Firebase
- **Stream.multi no fake**: emite estado atual ao assinar, espelhando Firebase authStateChanges
- **Chat placeholder**: escopo explícito do bolt 006, shell já reservado

### Deviations from Plan

- Nenhuma estrutural. Firebase options permanece placeholder até `flutterfire configure` (documentado no README).

### Dependencies Added

- [x] `flutter_riverpod` — estado global auth e acessibilidade
- [x] `go_router` — navegação declarativa com shell
- [x] `firebase_core` + `firebase_auth` + `google_sign_in` — autenticação Google
- [x] `shared_preferences` — cache local de prefs não sensíveis
- [x] `uuid` — geração de X-Request-Id no ApiClient

### Developer Notes

- Executar `flutterfire configure` antes de testar login em dispositivo real
- Windows requer Developer Mode para symlinks de plugins Flutter
- Testes manuais TalkBack/VoiceOver ficam no Stage 3 (Test)
