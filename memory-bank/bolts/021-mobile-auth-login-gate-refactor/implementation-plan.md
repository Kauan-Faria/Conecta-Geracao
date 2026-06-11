---
stage: plan
bolt: 021-mobile-auth-login-gate-refactor
created: 2026-06-11T14:00:00Z
---

## Implementation Plan: 001-mobile-auth-shell

### Objective

Refatorar o fluxo de entrada do app mobile para que **login seja a porta de entrada**, o link convidado fique na `LoginPage`, e a sessão convidado seja **efêmera** (somente em memória durante a visita atual — sem restauração entre cold starts).

### Deliverables

- **Roteamento** (`app_router.dart`): `initialLocation` e redirect para `/login`; remover `/welcome` do gate de auth
- **UI** (`login_page.dart`): link "Sem cadastro, sem complicações" com `enterAsGuest()` + invalidação de `chatControllerProvider`
- **Persistência guest** (`guest_session_repository.dart`, `guest_history_repository.dart`, `guest_session_gate.dart`): guest apenas em memória; limpar prefs em cold start
- **Deprecação welcome** (`welcome_page.dart`): remover rota `/welcome` ou redirecionar para `/login`
- **Testes** (`auth_routing_test.dart`, helpers): atualizar expectativas de roteamento e guest efêmero

### Dependencies

- **001-mobile-auth-shell** (complete): GoRouter, auth gate, shell — base de roteamento
- **010-mobile-auth-phone** (complete): LoginPage, OTP, fluxo convidado inicial na WelcomePage
- **Riverpod + GoRouter**: `authGateProvider`, `guestSessionGateProvider`, `routerRefreshProvider`
- **SharedPreferences**: hoje persiste `guest_session_started_at` (7 dias) e `guest_history_entries` — deve ser eliminado para cold start

### Technical Approach

#### 1. Roteamento (`app_router.dart`)

Estado atual:
- `initialLocation: '/welcome'`
- Redirect sem acesso → `/welcome`
- Rotas públicas incluem `/welcome`

Mudanças:
- `initialLocation: '/login'`
- Redirect sem acesso → `/login`
- Rotas públicas: `/login`, `/login/*`, `/onboarding/display-name` (sem `/welcome`)
- Remover rota `/welcome` e import de `WelcomePage` (ou manter redirect `/welcome` → `/login` para deep links legados)
- Manter redirect autenticado/guest com acesso de `/login` → `/home` (já existe parcialmente via `isLoginFlow`)

#### 2. UI — link convidado na LoginPage

Estado atual:
- Link "Sem cadastro, sem complicações" está em `WelcomePage` com `enterAsGuest()` + `ref.invalidate(chatControllerProvider)`

Mudanças:
- Adicionar link secundário no final de `LoginPage` (mesmo copy e semântica da WelcomePage)
- Ao tocar: `ref.invalidate(chatControllerProvider)` → `enterAsGuest()` → `context.go('/home')`
- Remover `_GuestLink` e lógica convidado de `WelcomePage` (ou remover arquivo inteiro se rota for eliminada)

#### 3. Persistência guest efêmera

Estado atual:
- `SharedPreferencesGuestSessionRepository`: persiste timestamp com retenção de 7 dias
- `GuestSessionGate.refresh()`: restaura `isGuestActive` de SharedPreferences no cold start
- `SharedPreferencesGuestHistoryRepository`: persiste histórico entre visitas

Mudanças (abordagem preferida — in-memory only):
- Substituir `SharedPreferencesGuestSessionRepository` por implementação **in-memory** (`InMemoryGuestSessionRepository`) que não persiste entre processos
- `GuestSessionGate.refresh()`: no cold start, chamar `clearGuestSession()` e garantir `_isGuestActive = false` (não restaurar de prefs)
- Remover ou simplificar `GuestHistoryRepository` — histórico guest não persiste entre visitas; manter lista em memória no chat controller se necessário para a sessão atual
- Limpar chaves legadas (`guest_session_started_at`, `guest_history_entries`) no primeiro boot pós-update para usuários existentes

Alternativa mínima (se preferir menos refactor):
- Manter repositórios SharedPreferences mas chamar `clearGuestSession()` + limpar history em todo `refresh()` no cold start
- Preferir abordagem in-memory por alinhar melhor com spec e evitar bugs de restauração acidental

#### 4. WelcomePage

- Remover rota `/welcome` do router
- Deletar `welcome_page.dart` se não houver outros usos, ou manter arquivo deprecated com redirect
- Atualizar testes que buscam "Começar agora" (texto da welcome)

#### 5. Testes

Atualizar `auth_routing_test.dart`:
- `unauthenticated user sees login page` — esperar "Receber código" e link convidado (não "Começar agora")
- `guest user reaches home without login` — tap no link na LoginPage
- Remover teste "start button opens login page" (obsoleto) ou substituir por verificação de elementos da login
- Novo teste: cold start com prefs guest legadas → usuário vê login (não home)
- Novo teste: guest entra → fecha app (simular novo ProviderScope/pumpApp) → vê login novamente

Atualizar helpers (`maps_test_helpers.dart`, `chat_page_test.dart`) que seedam `guest_session_started_at` em SharedPreferences — usar `enterAsGuest()` via UI ou override de gate in-memory.

### Acceptance Criteria

- [ ] Abrir app sem login → tela de login (nunca welcome como gate)
- [ ] Link "Sem cadastro, sem complicações" visível na `LoginPage`
- [ ] Convidado usa IA na visita atual; fechar e reabrir sem login → login de novo + chat reiniciado
- [ ] Usuário autenticado continua indo direto para home (sem regressão)
- [ ] Testes de roteamento e guest atualizados/passando

### Stories in Scope

| Story | Critério principal |
|-------|-------------------|
| **002-app-shell-navigation** | Redirect `/login` como gate; remover welcome do fluxo |
| **004-phone-otp-primary-login** | Link convidado na LoginPage |
| **007-guest-ephemeral-sessions** | Guest só em memória; sem SharedPreferences entre aberturas |

### Risk / Notes

- Testes que injetam guest via SharedPreferences precisam migrar para `enterAsGuest()` ou provider override
- Notificações e maps já checam `guestGate.isGuestActive` — comportamento in-memory não afeta esses fluxos durante a visita
- Limpar prefs legadas evita usuários beta ficarem presos em guest auto-restaurado
