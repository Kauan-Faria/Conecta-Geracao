---
id: 007-guest-ephemeral-sessions
unit: 001-mobile-auth-shell
intent: 001-digital-guidance
status: complete
priority: must
created: 2026-06-02T19:30:00.000Z
assigned_bolt: 021-mobile-auth-login-gate-refactor
implemented: true
---

# Story: 007-guest-ephemeral-sessions

## User Story

**As a** visitante que ainda não quer criar conta
**I want** experimentar o assistente sem cadastro, sabendo que minhas conversas não ficam salvas
**So that** eu teste o app com tranquilidade e decida entrar com telefone quando quiser guardar o histórico

## Acceptance Criteria

- [ ] **Given** não estou logado, **When** abro o app, **Then** vejo a tela de login (não a welcome)
- [ ] **Given** estou na tela de login, **When** escolho "Sem cadastro, sem complicações", **Then** entro no app como convidado com chat reiniciado e posso abrir o chat com a IA
- [ ] **Given** sou convidado, **When** envio mensagens, **Then** recebo respostas da IA normalmente **sem** chamar endpoints de persistência de conversa na API (sem `firebase_uid` remoto)
- [ ] **Given** sou convidado, **When** fecho o app e abro de novo **sem** fazer login, **Then** volto à tela de login e **não** retomo conversas anteriores — ao entrar sem conta de novo, chat reinicia do zero
- [ ] **Given** sou convidado, **When** vejo home ou lista de conversas, **Then** não aparecem conversas salvas na nuvem; verificações recentes vazias ou mensagem amigável
- [ ] **Given** uma única visita convidado em andamento, **When** continuo no chat sem sair, **Then** o contexto da conversa atual se mantém até encerrar sessão/app
- [ ] **Given** sou convidado no chat, **When** vejo o banner de login, **Then** texto explica que **entrar com celular** salva o histórico para retomar depois
- [ ] **Given** faço login por telefone, **When** completo autenticação, **Then** saio do modo convidado e passo a usar persistência autenticada (FR-6)

## Technical Notes

- Chat convidado: modo local / stub de IA ou endpoint anônimo **sem** gravar em `conversations` — alinhar com backend (guard rejeita sem token ou rota guest sem persist)
- **Não** persistir sessão convidado em SharedPreferences entre cold starts — guest ativo **somente em memória** durante a visita atual
- Ao `enterAsGuest()`, invalidar `chatControllerProvider` e **não** restaurar threads antigas
- Ao cold start: `clearGuestSession()` + redirect para `/login`
- Ao `exitGuest()` ou login, limpar estado local de chat convidado
- Link "Sem cadastro, sem complicações" na `LoginPage` (migrar de `WelcomePage`)
- Home: `isGuest` → seção "Verificações recentes" vazia com copy "Entre com seu celular para salvar suas conversas"

## Dependencies

### Requires
- 002-app-shell-navigation (roteamento guest)
- 003-ai-assistant-api / chat UI (comportamento sem persist)

### Enables
- Testes de usabilidade sem barreira de cadastro

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Convidado tenta "Ver todas" conversas | Lista vazia ou CTA para login |
| Convidado reabre app no mesmo dia | Volta à tela de login; sessão anterior **não** restaurada |
| Convidado com internet instável | Mensagem amigável; não perder mensagens **da sessão atual** em memória |
| Login durante conversa convidado | Opcional: avisar que histórico convidado não será migrado (sessão efêmera) |

## Out of Scope

- Migrar conversas de convidado para conta autenticada
- Histórico local de convidado entre reentradas
- Modo convidado offline com IA
