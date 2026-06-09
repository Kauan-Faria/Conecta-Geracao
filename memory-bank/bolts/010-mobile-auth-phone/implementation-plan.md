---
stage: plan
bolt: 010-mobile-auth-phone
created: 2026-06-02T21:00:00Z
---

## Implementation Plan: 010-mobile-auth-phone

### Objective

Evoluir a autenticação mobile para o público analfabeto digital: **telefone + SMS** como caminho principal, onboarding de nome obrigatório no primeiro acesso, **Google** apenas em tela secundária ("Entrar de outra forma"), e **modo convidado** com IA sem persistência remota nem histórico entre reentradas.

### Deliverables

#### Story 004 — Login por telefone (principal)
- [ ] Refatorar `LoginPage` com campo telefone (+55), máscara E.164 e botão "Receber código" em destaque
- [ ] Nova `PhoneOtpPage` com copy orientativo PT-BR, campo OTP 6 dígitos, autofill (`AutofillHints.oneTimeCode`)
- [ ] Cooldown 60s para reenvio; mensagens de erro simples em português
- [ ] Link "Entrar de outra forma" → rota `/login/alternative`
- [ ] Métodos no `AuthRepository` / `FirebaseAuthRepository`: `startPhoneVerification`, `confirmPhoneOtp`, mapeamento de erros Firebase Phone

#### Story 005 — Nome após primeiro login
- [ ] `DisplayNameOnboardingSheet` reutilizável (modal obrigatório, sem "Pular")
- [ ] `updateDisplayName` no repositório + gate pós-auth no router ou listener após login
- [ ] Fluxo: OTP ou Google sem `displayName` → sheet → home

#### Story 006 — Login alternativo
- [ ] `AlternativeLoginPage` com apenas botão Google (reutiliza `signInWithGoogle`)
- [ ] Remover Google da tela principal de telefone
- [ ] Navegação voltar para telefone; erros em português

#### Story 007 — Convidado efêmero
- [ ] Remover persistência de histórico entre visitas (`GuestHistoryRepository` não restaura threads antigas)
- [ ] `enterAsGuest()` não carrega histórico salvo; `exitGuest()` limpa estado local de chat
- [ ] Home/lista de conversas vazia para guest com copy sobre salvar histórico com celular
- [ ] Chat guest: sem chamadas autenticadas à API de conversas (manter comportamento atual ou reforçar guard)
- [ ] Banner no chat convidado atualizado (celular salva histórico)

#### Infra / rotas
- [ ] Rotas: `/login`, `/login/otp`, `/login/alternative` em `app_router.dart`
- [ ] Redirect pós-login considera onboarding de nome pendente
- [ ] Dependência opcional: `pinput` ou máscara manual + `sms_autofill` (avaliar no implement — preferir mínimo de pacotes se `TextField` + autofill nativo bastar)

### Dependencies

| Dependência | Motivo |
|-------------|--------|
| **Bolt 001-mobile-auth-shell** (complete) | Shell, Riverpod, Google sign-in base, guest gate, roteamento |
| **Firebase Phone Auth** | Console: Phone Auth habilitado; números de teste para dev |
| **reCAPTCHA / App Check** | Android/iOS — necessário para `verifyPhoneNumber` |
| **flutter_riverpod + go_router** | Já no projeto |
| **Pacote OTP (opcional)** | `pinput` ^5.x ou campo custom — decisão no implement |

### Technical Approach

#### 1. Camada de dados (`features/auth/data/`)

Estender `AuthRepository`:

```text
Future<void> startPhoneVerification(String e164Phone, {required void Function(String verificationId) onCodeSent, ...});
Future<AppUser> confirmPhoneOtp({required String verificationId, required String smsCode});
Future<void> updateDisplayName(String name);
```

`FirebaseAuthRepository`:

- `verifyPhoneNumber` com callbacks `codeSent`, `verificationFailed`, `verificationCompleted` (auto-retrieve Android)
- Normalizar telefone para E.164 (+55…) antes da chamada
- `PhoneAuthProvider.credential` + `signInWithCredential`
- Erros: `invalid-verification-code`, `session-expired`, `network-request-failed` → mensagens PT-BR da story

#### 2. Controllers (`presentation/`)

- `PhoneAuthController` (AsyncNotifier): estado `idle | sending | awaitingOtp | verifying`
- `AuthController`: manter Google; delegar phone ao controller dedicado ou métodos no mesmo notifier
- Após login bem-sucedido: checar `AppUser.displayName` → disparar onboarding se null/empty

#### 3. UI (`presentation/`)

| Arquivo | Responsabilidade |
|---------|------------------|
| `login_page.dart` | Telefone principal, link alternativo |
| `phone_otp_page.dart` | OTP + reenvio + copy acessível |
| `alternative_login_page.dart` | Só Google |
| `display_name_onboarding_sheet.dart` | Modal "Como podemos te chamar?" |

Copy OTP (story): título "Código no seu celular", textos sobre SMS 6 números, sugestão do teclado, "Não recebi o código".

Alvos ≥ 48dp, `Semantics` em todos os botões (ux-guide).

#### 4. Roteamento

- Públicas: `/welcome`, `/login`, `/login/otp`, `/login/alternative`
- Redirect: autenticado sem nome → bloquear home até sheet completar (flag local ou query `needsDisplayName`)
- Login completo → `exitGuest()` no gate
- Welcome "Começar" → `/login` (já é push; manter)

#### 5. Convidado efêmero

- `GuestSessionGate.enterAsGuest()`: não chamar `loadHistory()`; opcionalmente deprecar `GuestHistoryRepository` ou deixar no-op para persistência entre sessões
- Limpar `guest_history_entries` ao entrar como guest
- Verificar `home_page` / `conversation_list_page` / `chat_page` para `isGuestActive`
- Garantir que reentrada guest = nova sessão de chat em memória apenas

#### 6. Testes (Estágio 3)

- Widget tests: validação telefone, botão desabilitado, mensagens OTP
- `auth_routing_test.dart`: rotas públicas, redirect com/sem nome (mocks)
- Manual: Firebase test phone numbers, TalkBack no fluxo telefone + sheet nome

### Acceptance Criteria

- [ ] Login por telefone funcional em dev (número de teste Firebase)
- [ ] Primeiro acesso coleta nome; retorno não repete modal
- [ ] Google acessível só via "Entrar de outra forma"
- [ ] Tela OTP com textos orientativos + autofill SMS
- [ ] Convidado: chat com IA, sem persistência remota; nova sessão a cada reentrada
- [ ] TalkBack/VoiceOver no fluxo telefone + modal de nome (checklist manual no test-walkthrough)
- [ ] Story `001-firebase-login-google` realinhada na UI (Google na tela secundária, sem regressão de sessão)

### Out of Scope (confirmado nas stories)

- E-mail/senha em "Entrar de outra forma"
- Apple / Facebook login
- Migração de histórico convidado para conta autenticada
- Tabela `users` no Postgres

### Risks & Mitigations

| Risco | Mitigação |
|-------|-----------|
| SMS custo em dev | Números de teste Firebase |
| reCAPTCHA falha no emulador | Testar em dispositivo real; documentar no walkthrough |
| Auto-verify Android vs iOS | Tratar `verificationCompleted` e fluxo manual OTP |
