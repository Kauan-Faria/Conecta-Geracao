# Inception Log: 001-digital-guidance

## 2026-06-11T12:00:00Z — Refinamento: login como porta de entrada

**Origem**: observação do produto (sessão inception)

**Decisão**:
- Usuário sem login **sempre** cai na tela de login ao abrir o app
- Na tela de login, escolhe: fazer login por telefone **ou** entrar sem conta
- Modo convidado **não** persiste entre cold starts — cada abertura sem login reinicia o fluxo e o chat
- Welcome deixa de ser porta de entrada (redirect `/welcome` → `/login`)

**Artefatos atualizados**:
- `requirements.md` (FR-8, FR-8.2, Open Questions)
- `system-context.md`
- Stories: `002-app-shell-navigation`, `004-phone-otp-primary-login`, `007-guest-ephemeral-sessions`

**Gap de implementação** (Construction):
- `app_router.dart`: `initialLocation` ainda é `/welcome`; guest persiste 7 dias em SharedPreferences
- `WelcomePage` ainda contém link convidado; `LoginPage` ainda não tem

**Próximo passo sugerido**: bolt de ajuste em `010-mobile-auth-phone` ou novo bolt simples

**Bolt criado**: \`021-mobile-auth-login-gate-refactor\` (2026-06-11T12:30:00Z)
