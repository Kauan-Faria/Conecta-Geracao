---
id: 008-tts-controls-and-playback-states
unit: 001-chat-voice-assist-ui
intent: 006-chat-voice-assist
status: complete
priority: must
created: 2026-08-06T22:45:00.000Z
assigned_bolt: 030-chat-voice-assist-ui
implemented: true
---

# Story: 008-tts-controls-and-playback-states

## User Story

**As a** usuário que acompanha a IA só ouvindo
**I want** ver qual mensagem está sendo falada e ter controles claros de ouvir, parar e ouvir de novo
**So that** eu controle a leitura sem confusão

## Acceptance Criteria

- [ ] **Given** uma mensagem do assistente, **When** olho os controles, **Then** existem ações de ouvir, parar e reproduzir novamente (podem ser o mesmo botão em estados diferentes, desde que rótulos/semântica deixem claro).
- [ ] **Given** TTS ativo, **When** uma mensagem está sendo falada, **Then** há destaque visual nessa bolha/mensagem.
- [ ] **Given** o domínio de playback, **When** observo o estado, **Then** há estados claros: `idle`, `loading`, `speaking`, `stopped`, `error`, e `paused` se pause for confiável.
- [ ] **Given** o toggle de preferência, **When** uso TalkBack, **Then** o rótulo comunica “Ler respostas em voz alta” (ligado/desligado).
- [ ] **Given** mensagens do usuário, **When** renderizo a bolha, **Then** não há controles TTS nem auto-leitura.

## Technical Notes

- Evoluir `TtsPlaybackStatus` sem quebrar consumidores: mapear aliases se necessário; atualizar testes do 028.
- Manter controles na `ChatMessageBubble`; highlight via `speakingMessageId`.
- Preferência já existe (`chat_auto_tts_enabled`) — só alinhar copy/labels se precisar.
- Testes: estados do controller + regressão UI da bolha/header.

## Dependencies

### Requires
- 004-tts-assistant-replies
- 005-auto-tts-preference
- 007-tts-playback-lifecycle-guards

### Enables
- Experiência TTS completa e acessível no Android

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Replay da mesma mensagem | Para (se falando) ou reinicia do início |
| Erro durante speak | Estado `error` + feedback amigável; chat ok |
| loading curto na init | UI pode mostrar loading sem travar |

## Out of Scope

- Player de áudio avançado (seek, velocidade na UI)
- Escolha de voz/timbre pelo usuário
- iOS
