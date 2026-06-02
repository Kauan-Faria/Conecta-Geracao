---
stage: plan
bolt: 006-digital-guidance-ui
created: 2026-06-01T20:00:00Z
---

## Implementation Plan: 006-digital-guidance-ui

### Objective

Tela de chat acessível conectada à API de conversas (bolt 005), com UI de checkpoints Sim/Não e indicador "Pensando...", seguindo o mockup fornecido.

### Deliverables

- Feature `chat/` (domain, data, presentation) com Riverpod
- `ApiClient` estendido com GET/POST e `ApiException`
- `ChatPage` substituindo placeholder no shell
- Widgets: hero header, bolhas, input, quick replies, typing indicator
- Testes unitários e de widget

### Dependencies

- **005-ai-assistant-api**: endpoints `/api/v1/conversations` e `/:id/messages`
- **001-mobile-auth-shell**: tema, ApiClient, auth token
- **http**: chamadas REST

### Technical Approach

- Estado local com `ChatController` (Notifier): mensagens, envio, erro
- Cria conversa na primeira mensagem; resposta assistant vem da API
- Checkpoints detectados heuristicamente (última msg assistant com `?` ou frases de checkpoint)
- Convidados sem token Firebase veem CTA para login (API exige Bearer)
- Layout fiel ao mockup: hero teal, bolhas user/assistant, input + botão Gravar (stub)

### Acceptance Criteria

- [ ] Enviar mensagem exibe bolha user + resposta IA
- [ ] Indicador "Pensando..." acessível durante envio
- [ ] Bolhas com texto grande e contraste AA
- [ ] Erro de rede com mensagem simples e "Tentar novamente"
- [ ] Botões Sim/Não grandes e acessíveis quando checkpoint detectado
- [ ] Texto livre sempre disponível no input
