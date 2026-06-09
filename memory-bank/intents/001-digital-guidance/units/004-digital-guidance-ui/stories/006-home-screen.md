---
id: 006-home-screen
unit: 004-digital-guidance-ui
intent: 001-digital-guidance
status: complete
priority: must
updated: 2026-06-03T01:39:28Z
assigned_bolt: 009-digital-guidance-ui
implemented: true
---

# Story: 006-home-screen

## User Story

**As a** usuário que abre o app
**I want** uma tela inicial clara com ajuda imediata e atalhos para tarefas comuns
**So that** eu saiba por onde começar e inicie uma conversa com a IA sem precisar pensar no que digitar

## Acceptance Criteria

### Layout e identidade visual

- [ ] **Given** estou logado ou em sessão convidado, **When** abro a aba Início, **Then** vejo cabeçalho com logo ConectaGeração, nome do app e ícone de configurações (≥ 48dp)
- [ ] **Given** a tela inicial, **When** visualizo, **Then** vejo seção hero com título "Antes de fazer algo importante...", subtítulo "Confira rapidamente e evite erros." e botão primário "Quero ajuda agora >"
- [ ] **Given** a tela inicial, **When** visualizo, **Then** vejo seção "O que você quer fazer?" com grid 2 colunas dos 6 atalhos MVP (PIX, Gov.br, WhatsApp, Wi-Fi, Boleto, Golpe)
- [ ] **Given** a tela inicial, **When** visualizo, **Then** vejo seção "Verificações recentes" com link "Ver todas" e até 3 conversas recentes
- [ ] **Given** qualquer elemento interativo, **When** exibido, **Then** alvos de toque ≥ 48dp, rótulos textuais e contraste conforme `ux-guide.md`

### Fluxo: Quero ajuda agora

- [ ] **Given** estou na tela inicial, **When** toco em "Quero ajuda agora", **Then** sou levado à aba Chat com conversa vazia pronta para digitar
- [ ] **Given** naveguei via "Quero ajuda agora", **When** chego ao chat, **Then** nenhuma mensagem é enviada automaticamente

### Fluxo: Ações rápidas (atalhos MVP)

- [ ] **Given** estou na tela inicial, **When** toco em um atalho MVP, **Then** sou levado à aba Chat, nova conversa inicia com `topicSlug` correspondente e mensagem contextual relacionada à ação (ex.: PIX → "Desejo fazer um PIX")
- [ ] **Given** toquei em atalho MVP, **When** a mensagem é enviada, **Then** a IA responde normalmente conduzindo o fluxo do tópico

### Fluxo: Verificações recentes

- [ ] **Given** tenho conversas anteriores, **When** vejo "Verificações recentes", **Then** listo até 4 conversas mais recentes com título/tópico e data relativa (ex.: "Hoje, 10:24")
- [ ] **Given** não tenho conversas, **When** vejo a seção, **Then** vejo estado vazio amigável (sem erro)
- [ ] **Given** toco em uma verificação recente, **When** ação completa, **Then** abro a conversa na aba Chat
- [ ] **Given** toco em "Ver todas", **When** ação completa, **Then** sou levado à lista completa de conversas

### Navegação auxiliar

- [ ] **Given** estou na tela inicial, **When** toco no ícone de configurações do cabeçalho, **Then** sou levado à aba Configurações

## Technical Notes

- Substituir placeholder atual de `HomePage` em `shell_pages.dart`
- Reutilizar `ChatController.startWithTopic` para "Fazer um PIX"; adicionar `startWithMessage(String content, {String? topicSlug})` para demais ações rápidas
- Navegação cross-tab: `StatefulNavigationShell.goBranch(1)` + query params ou provider de intenção de chat (`initialMessage`, `conversationId`)
- Cards de ação rápida: ícone teal em círculo claro, título, chevron — conforme mockup
- Seção recentes: reutilizar `ConversationSummary` / cache existente da story 003
- Mensagens starter definidas em `home_quick_actions.dart` (domínio UI), separadas dos 6 tópicos MVP do chat vazio

## Dependencies

### Requires
- 001-chat-screen
- 003-conversation-history-list

### Enables
- Melhor descoberta do assistente para usuários novos

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Offline ao tocar ação rápida | Mensagem de erro amigável; não navega ou navega com aviso |
| Envio em andamento no chat | Ignorar novo toque até concluir |
| Sessão convidado sem histórico remoto | Recentes mostra cache local ou estado vazio |
| Usuário toca "Quero ajuda" durante chat ativo | Resetar estado para nova conversa vazia |

## Out of Scope

- Redesenho da tela de chat ou remoção dos atalhos MVP no chat vazio (decisão em aberto — ver requirements FR-10)
- Novos tópicos na base de conhecimento além dos 6 MVP
- Notificações push ou badges na home
