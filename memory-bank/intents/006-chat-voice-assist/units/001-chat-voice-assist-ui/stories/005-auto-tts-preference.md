---
id: 005-auto-tts-preference
unit: 001-chat-voice-assist-ui
intent: 006-chat-voice-assist
status: complete
priority: should
created: 2026-07-24T19:12:00.000Z
assigned_bolt: 028-chat-voice-assist-ui
implemented: true
---

# Story: 005-auto-tts-preference

## User Story

**As a** usuário
**I want** ligar ou desligar a leitura automática das respostas
**So that** eu controle quando o app fala sozinho

## Acceptance Criteria

- [ ] **Given** primeiro uso sem preferência salva, **When** o app inicia o chat, **Then** auto-TTS está **ligado** por padrão.
- [ ] **Given** auto-TTS ligado, **When** desligo o toggle, **Then** novas respostas **não** iniciam leitura sozinhas (botão “ouvir” continua disponível).
- [ ] **Given** alterei a preferência, **When** fecho e reabro o app, **Then** o valor permanece.
- [ ] **Given** o controle de preferência, **When** uso TalkBack, **Then** há label semântico claro (ligado/desligado).

## Technical Notes

- Persistir com `shared_preferences` (já no projeto) sob chave estável (ex.: `chat_auto_tts_enabled`).
- Toggle na tela de chat (menos fricção) ou em Configurações — preferir o menos invasivo no plan.

## Dependencies

### Requires
- 004-tts-assistant-replies

### Enables
- Conforto em ambientes públicos / controle do usuário

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Desligar durante leitura | Interrompe a leitura atual (recomendado) |
| Limpar dados do app | Volta ao padrão ligado |

## Out of Scope

- Sincronizar preferência com backend/conta
