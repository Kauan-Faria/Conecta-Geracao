---
stage: plan
bolt: 023-email-password-auth
created: 2026-06-12T02:00:00Z
---

## Implementation Plan: 001-mobile-auth-login-ui

### Objective

Implementar cadastro e login por **e-mail e senha** via Firebase Auth, tela de verificação de e-mail pós-cadastro, recuperação de senha após 4 tentativas falhas, e integração completa no GoRouter — substituindo o stub `/login/email` e conectando os fluxos existentes (telefone, Google, convidado) sem regressão.

### Deliverables

#### Repositório (story 004)

- Extensão de `AuthRepository` com:
  - `signUpWithEmailAndPassword(String email, String password)`
  - `signInWithEmailAndPassword(String email, String password)`
  - `sendEmailVerification()`
  - `sendPasswordResetEmail(String email)`
  - `reloadCurrentUser()` + `isEmailVerified()`
- Implementação em `FirebaseAuthRepository` com mapeamento de erros PT-BR
- Campo `emailVerified` em `AppUser` (necessário para gate de roteamento)
- Atualização de `FakeAuthRepository` para testes
- Testes unitários de mapeamento de erros e-mail/senha

#### UI — Cadastro/Login e-mail (story 005)

- `EmailAuthPage` substituindo `EmailLoginStubPage`
- `EmailAuthController` (Riverpod `StateNotifier`) com modo `signup` / `signIn`
- Formulário: e-mail, senha, confirmar senha (oculto no login)
- Toggle "Já tenho conta" / "Criar conta"
- Validação client-side (senhas coincidem, campos obrigatórios)
- Botão Google reutilizando `AuthController.signInWithGoogle()`
- Componentes `AuthScreenScaffold`, `AuthCtaButton`, `AuthBrandHeader` (bolt 022)

#### UI — Verificação e-mail (story 006)

- `EmailVerificationPage` conforme mockup `191600.png`
- Título "Vamos finalizar seu cadastro" + copy sobre link no e-mail
- Botão "Avançar" com `reloadCurrentUser()` + checagem `emailVerified`
- "Reenviar e-mail" com cooldown 60s
- "Voltar e editar Email" → `/login/email` em modo cadastro
- Ícone ilustrativo de e-mail (adaptação visual do mockup — Firebase usa link, não OTP)

#### Roteamento (story 007)

- Rotas `/login/email` e `/login/email-verify` funcionais
- Redirect `/login/alternative` → `/login/email`
- Gate: usuário logado com e-mail não verificado → `/login/email-verify`
- Provider `needsEmailVerificationProvider`
- Ajuste no redirect do GoRouter para não enviar usuário não verificado para `/home`
- Atualização de `auth_routing_test.dart`

#### Esqueci senha (story 008)

- Contador de tentativas falhas em `EmailAuthController` (sessão da tela, não persistido)
- Banner destacado após 4ª tentativa falha consecutiva
- Link "Esqueci minha senha" (discreto antes do 4º erro, destacado depois)
- `sendPasswordResetEmail` com confirmação amigável
- Contador zera em login bem-sucedido ou reset enviado
- Semantics e alvo ≥ 48dp

#### Infra / docs

- Nota em `apps/mobile/.env.example` ou README: habilitar Email/Password no Firebase Console

### Dependencies

- **022-auth-ui-foundation** (in-progress, implement completo): `AuthScreenScaffold`, `AuthCtaButton`, `AuthBrandHeader`, telas telefone/OTP refatoradas, stub `/login/email` — **componentes já disponíveis no código**
- **021-mobile-auth-login-gate-refactor** (complete): login gate, convidado, roteamento base
- **Firebase Auth Email/Password**: habilitar no console `conecta-geracao`
- **firebase_auth** SDK: já presente no projeto

### Technical Approach

#### 1. Domínio e repositório

1. Adicionar `emailVerified` (bool, default `true` para Google/telefone sem e-mail) em `AppUser`
2. Estender `AuthRepository` com métodos e-mail/senha
3. Em `FirebaseAuthRepository`:
   - `createUserWithEmailAndPassword` → `sendEmailVerification()` se `!emailVerified`
   - `signInWithEmailAndPassword`
   - `sendPasswordResetEmail`
   - `reloadCurrentUser()` via `currentUser.reload()`
   - Novo `_mapEmailPasswordError()` com códigos da story 004
4. Atualizar `_mapUser` para incluir `emailVerified: user.emailVerified`

#### 2. Controller e estado

- `EmailAuthController` (`StateNotifier<EmailAuthState>`):
  - `mode`, `failedAttempts`, `errorMessage`, `isLoading`, `resetEmailSent`
  - Métodos: `signUp`, `signIn`, `sendPasswordReset`, `toggleMode`, `clearError`
  - Contador incrementa apenas em `signIn` com credencial inválida
  - Zera em sucesso ou reset enviado

#### 3. Telas

- `EmailAuthPage`: layout conforme mockup `191555.png`
  - Header de marca, campos com `TextFormField`, toggle senha acessível
  - CTA "Avançar" primário teal; Google secundário azul
  - Banner condicional após 4 erros (story 008)
- `EmailVerificationPage`: layout conforme mockup `191600.png`
  - Ilustração de envelope no lugar das 4 caixas OTP
  - Cooldown timer para reenvio (60s)

#### 4. Roteamento

- Substituir `EmailLoginStubPage` por `EmailAuthPage` em `app_router.dart`
- Adicionar rota `email-verify` → `EmailVerificationPage`
- Redirect `/login/alternative` → `/login/email` (remover ou manter `AlternativeLoginPage` como redirect)
- Novo provider:

```dart
final needsEmailVerificationProvider = Provider<bool>((ref) {
  final user = ref.watch(authGateProvider).user;
  if (user == null) return false;
  // Apenas contas com e-mail (cadastro e-mail) precisam verificação
  return user.email != null && !user.emailVerified;
});
```

- Ajustar redirect em `app_router.dart`:
  - Se `needsEmailVerification` e não está em `/login/email-verify` nem em fluxo de logout → redirect
  - Exceção: rotas `/login/*` permitidas para usuário não verificado editar e-mail
  - `hasAccess && isLoginFlow && !needsDisplayName` só redireciona para `/home` se `!needsEmailVerification`

#### 5. Testes

- `firebase_auth_repository_email_test.dart`: mapeamento de erros (mock `FirebaseAuth`)
- `email_auth_controller_test.dart`: contador de tentativas, reset, toggle modo
- `auth_routing_test.dart`: rotas novas, redirect alternative, gate email unverified, guest sem regressão
- Widget test básico de `EmailAuthPage` (modo signup/login toggle)

### File Plan

| Ação | Arquivo |
|------|---------|
| Modificar | `apps/mobile/lib/features/auth/domain/app_user.dart` |
| Modificar | `apps/mobile/lib/features/auth/data/auth_repository.dart` |
| Modificar | `apps/mobile/lib/features/auth/data/firebase_auth_repository.dart` |
| Criar | `apps/mobile/lib/features/auth/presentation/email_auth_controller.dart` |
| Criar | `apps/mobile/lib/features/auth/presentation/email_auth_page.dart` |
| Criar | `apps/mobile/lib/features/auth/presentation/email_verification_page.dart` |
| Criar | `apps/mobile/lib/features/auth/presentation/email_verification_gate.dart` |
| Modificar | `apps/mobile/lib/core/routing/app_router.dart` |
| Modificar | `apps/mobile/lib/core/routing/routing_providers.dart` |
| Remover | `apps/mobile/lib/features/auth/presentation/email_login_stub_page.dart` |
| Modificar | `apps/mobile/test/helpers/fake_auth_repository.dart` |
| Criar | `apps/mobile/test/features/auth/firebase_auth_repository_email_test.dart` |
| Criar | `apps/mobile/test/features/auth/email_auth_controller_test.dart` |
| Modificar | `apps/mobile/test/features/auth/auth_routing_test.dart` |

### Acceptance Criteria

- [ ] Cadastro e-mail → verificação → onboarding/home (fluxo completo)
- [ ] Login e-mail para conta existente (verificado → home; não verificado → email-verify)
- [ ] Google na mesma tela e-mail funciona sem regressão
- [ ] "Esqueci minha senha" após 4 erros + e-mail de reset Firebase
- [ ] Telefone e convidado sem regressão
- [ ] `/login/alternative` redireciona para `/login/email`
- [ ] Gate `emailVerified` impede acesso a rotas protegidas
- [ ] Testes unitários (repository + controller) + widget (router) passando
- [ ] Erros Firebase mapeados para PT-BR conforme story 004
- [ ] Acessibilidade: Semantics nos CTAs, alvos ≥ 48dp

### Risks & Notes

- **Bolt 022 ainda em test**: componentes compartilhados já implementados; risco baixo
- **Firebase Console**: Email/Password deve estar habilitado manualmente antes de testes em dispositivo
- **Deep link de verificação**: nice-to-have; bolt foca em reload manual via "Avançar"
- **Segurança reset**: `user-not-found` retorna mensagem genérica (não revelar se e-mail existe)
