# Implementation Plan: 025-auth-prototype-corrections

## Gap Analysis (protótipo vs código atual)

| Mockup | Status anterior | Ação |
|--------|-----------------|------|
| `primeira_tela.png` | ✅ Alinhado | Nenhuma |
| `login_telefone.png` | ❌ Faltavam Google, convidado, CTA e-mail renomeado | Atualizar `PhoneLoginPage` |
| `token_telefone.png` | ✅ Alinhado | Nenhuma |
| `cadastro_email.png` | ⚠️ Toggle login/cadastro na mesma tela; sem convidado | Ajustar `EmailAuthPage` signup |
| `login_emailsenha.png` | ❌ Login misturado com cadastro via toggle | Tela signin dedicada via rota |
| `token_emailsenha.png` | ✅ Alinhado | Nenhuma |

## Arquivos a alterar

1. `apps/mobile/lib/features/auth/presentation/phone_login_page.dart`
2. `apps/mobile/lib/features/auth/presentation/email_auth_page.dart`
3. `apps/mobile/test/features/auth/auth_phone_screens_test.dart`
4. `apps/mobile/test/features/auth/auth_routing_test.dart`

## Ordem de implementação

1. `PhoneLoginPage` — CTAs e handlers
2. `EmailAuthPage` — modos separados, copy, navegação
3. Testes — atualizar expectativas de texto e fluxos

## Navegação revisada

```text
/login (welcome)
  ├─ Fazer cadastro → /login/phone
  │    ├─ Continuar → /login/otp
  │    ├─ Entra com Email e senha → /login/email?mode=signin
  │    ├─ Google → /home
  │    └─ Entrar sem Cadastro → /home (guest)
  └─ Continua sem Cadastro → /home (guest)

/login/email (signup)
  ├─ Continuar → /login/email-verify
  ├─ Google → /home
  └─ Entrar sem Cadastro → /home (guest)

/login/email?mode=signin
  ├─ Continuar → /home ou /login/email-verify
  ├─ Não possuo Cadastro → /login/email
  └─ Google → /home
```
