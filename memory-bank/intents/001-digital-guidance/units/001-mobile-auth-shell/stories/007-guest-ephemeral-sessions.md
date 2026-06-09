---
id: 007-guest-ephemeral-sessions
unit: 001-mobile-auth-shell
intent: 001-digital-guidance
status: complete
priority: must
created: 2026-06-02T19:30:00Z
assigned_bolt: 010-mobile-auth-phone
implemented: true
---

# Story: 007-guest-ephemeral-sessions

## User Story

**As a** visitante que ainda não quer criar conta
**I want** experimentar o assistente sem cadastro, sabendo que minhas conversas não ficam salvas
**So that** eu teste o app com tranquilidade e decida entrar com telefone quando quiser guardar o histórico

## Acceptance Criteria

- [ ] **Given** estou na welcome, **When** escolho experimentar sem conta, **Then** entro no app como convidado e posso abrir o chat com a IA
- [ ] **Given** sou convidado, **When** envio mensagens, **Then** recebo respostas da IA normalmente **sem** chamar endpoints de persistência de conversa na API (sem `firebase_uid` remoto)
- [ ] **Given** sou convidado, **When** fecho o app ou saio da sessão convidado e entro de novo como convidado, **Then** **não** retomo conversas anteriores — nova janela de contexto (lista de histórico vazia ou estado inicial)
- [ ] **Given** sou convidado, **When** vejo home ou lista de conversas, **Then** não aparecem conversas salvas na nuvem; verificações recentes vazias ou mensagem amigável
- [ ] **Given** uma única visita convidado em andamento, **When** continuo no chat sem sair, **Then** o contexto da conversa atual se mantém até encerrar sessão/app
- [ ] **Given** sou convidado no chat, **When** vejo o banner de login, **Then** texto explica que **entrar com celular** salva o histórico para retomar depois
- [ ] **Given** faço login por telefone, **When** completo autenticação, **Then** saio do modo convidado e passo a usar persistência autenticada (FR-6)

## Technical Notes

- Chat convidado: modo local / stub de IA ou endpoint anônimo **sem** gravar em `conversations` — alinhar com backend (guard rejeita sem token ou rota guest sem persist)
- **Não** usar `GuestHistoryRepository` para simular histórico entre visitas — remover ou limitar a sessão atual apenas
- Ao `enterAsGuest()`, não restaurar threads antigas do SharedPreferences
- Ao `exitGuest()` ou login, limpar estado local de chat convidado
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
| Convidado com internet instável | Mensagem amigável; não perder mensagens **da sessão atual** em memória |
| Login durante conversa convidado | Opcional: avisar que histórico convidado não será migrado (sessão efêmera) |

## Out of Scope

- Migrar conversas de convidado para conta autenticada
- Histórico local de convidado entre reentradas
- Modo convidado offline com IA
