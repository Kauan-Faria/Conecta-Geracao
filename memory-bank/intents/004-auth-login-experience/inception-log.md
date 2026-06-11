---
intent: 004-auth-login-experience
created: 2026-06-11T22:00:00Z
updated: 2026-06-11T22:00:00Z
---

# Inception Log: Auth Login Experience

## 2026-06-11T22:00:00Z — Intent criada

**Contexto**: Usuário solicitou alinhar telas de login aos mockups em `public/telas/` e adicionar login/cadastro por e-mail e senha além do Firebase existente (telefone, Google, convidado).

**Decisões**:

1. **Nova intent `004-auth-login-experience`** — escopo separado de `001-digital-guidance` para refino visual + e-mail/senha, sem reabrir bolts concluídos desnecessariamente.
2. **Unit única `001-mobile-auth-login-ui`** — todo o trabalho é Flutter frontend + extensão do `FirebaseAuthRepository`.
3. **OTP telefone**: mockup mostra 4 caixas; Firebase SMS usa **6 dígitos** — UI adaptada para 6 caixas no mesmo estilo visual.
4. **Verificação e-mail**: mockup mostra token de 4 dígitos; Firebase Email Auth usa **link no e-mail** — tela mantém layout do mockup com instruções + reenvio + botão "Avançar" após verificação detectada via `reload()`.
5. **`/login/alternative` deprecada** em favor de `/login/email` com Google na mesma tela.
6. **Backend NestJS**: sem alterações; ID token Firebase permanece contrato da API.

**Próximo passo**: Construction via bolts `022-auth-ui-foundation` e `023-email-password-auth`.
