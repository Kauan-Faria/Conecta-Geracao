---
stage: test
bolt: 001-mobile-auth-shell
created: 2026-06-01T16:00:00Z
---

## Test Report: 001-mobile-auth-shell

### Summary

- **Tests**: 11/11 passed
- **Coverage**: 54.7% (linhas executáveis em `lib/`)
- **Lint**: `flutter analyze` — sem issues

### Test Files

- [x] `test/core/theme/app_theme_test.dart` — paleta padrão, alto contraste e escala tipográfica
- [x] `test/core/widgets/app_button_test.dart` — alvo mínimo 48dp e rótulo Semantics
- [x] `test/features/accessibility/accessibility_prefs_test.dart` — modelo e multiplicadores de fonte
- [x] `test/features/accessibility/accessibility_prefs_repository_test.dart` — persistência SharedPreferences
- [x] `test/features/auth/auth_routing_test.dart` — redirect para login quando não autenticado
- [x] `test/features/shell/app_shell_test.dart` — navegação Início/Chat/Configurações autenticado
- [x] `test/helpers/fake_auth_repository.dart` — fake reutilizável para testes de auth

### Acceptance Criteria Validation

| Critério | Status | Evidência |
|----------|--------|-----------|
| Login Google funcional | ⚠️ Manual | Requer Firebase configurado (`flutterfire configure`); fluxo implementado |
| Erro de login em português | ✅ Auto | `AuthException` com mensagens PT; cancelamento silencioso |
| Sessão persistente | ⚠️ Manual | Firebase `authStateChanges()`; validar reabrir app em dispositivo |
| Cancelamento Google sign-in | ✅ Auto | `isCancelled: true` sem exibir erro na UI |
| Navegação Início/Chat/Configurações | ✅ Auto | `app_shell_test.dart` |
| Redirect não autenticado → login | ✅ Auto | `auth_routing_test.dart` |
| Alvos de toque ≥ 48dp | ✅ Auto | `app_button_test.dart` |
| Fonte ajustável atualiza app | ✅ Auto | `app_theme_test.dart` + controller persiste prefs |
| Alto contraste | ✅ Auto | `app_theme_test.dart` valida paleta HC |
| Persistência de prefs | ✅ Auto | `accessibility_prefs_repository_test.dart` |
| `flutter analyze` sem erros | ✅ Auto | 0 issues |
| TalkBack/VoiceOver no login | ⚠️ Manual | Checklist abaixo |

### Manual Verification Checklist

**Pré-requisito**: `flutterfire configure` + dispositivo/emulador

#### Login (TalkBack / VoiceOver)

- [ ] Botão "Entrar com Google" anunciado com rótulo claro
- [ ] Mensagem de erro (sem internet) lida pelo leitor de tela
- [ ] Após login, redirect para tela Início

#### Navegação

- [ ] Bottom nav: Início, Chat, Configurações com rótulos textuais
- [ ] Cada destino anunciado corretamente

#### Acessibilidade

- [ ] Alterar fonte em Configurações reflete imediatamente
- [ ] Alto contraste visível em todas as telas
- [ ] Fechar e reabrir app mantém preferências

### Issues Found

- **Corrigido durante testes**: race condition no redirect — `AuthGate` sincroniza estado de auth com GoRouter (substituiu `StreamProvider` no redirect)
- **Pendente setup**: `firebase_options.dart` ainda placeholder até FlutterFire CLI

### Notes

- Cobertura 54.7% é adequada para MVP — caminhos Firebase real não exercitados em CI (mock via `FakeAuthRepository`)
- Widget tests cobrem fluxos críticos de routing, tema e persistência
- Testes E2E de login Google devem ser feitos manualmente após configurar Firebase
