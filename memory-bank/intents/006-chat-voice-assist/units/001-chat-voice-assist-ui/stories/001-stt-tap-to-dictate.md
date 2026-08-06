---
id: 001-stt-tap-to-dictate
unit: 001-chat-voice-assist-ui
intent: 006-chat-voice-assist
status: complete
priority: must
created: 2026-07-24T19:12:00.000Z
assigned_bolt: 027-chat-voice-assist-ui
implemented: true
---

# Story: 001-stt-tap-to-dictate

## User Story

**As a** usuário com dificuldade para digitar
**I want** tocar no botão de gravar, falar, e tocar de novo para parar
**So that** minha fala vire texto no campo e eu possa confirmar antes de enviar

## Acceptance Criteria

- [ ] **Given** Android com STT disponível e permissão concedida, **When** toco em Gravar, **Then** o app entra em modo ouvindo.
- [ ] **Given** estou ouvindo, **When** toco novamente para parar, **Then** a escuta encerra e o texto reconhecido aparece no campo de mensagem.
- [ ] **Given** texto preenchido via STT, **When** não toco em enviar, **Then** a mensagem **não** é enviada automaticamente.
- [ ] **Given** texto via STT no campo, **When** toco em enviar, **Then** a mensagem segue o mesmo fluxo de envio já existente no chat.
- [ ] **Given** estou ouvindo, **When** a engine retorna texto parcial (se suportado), **Then** o campo pode atualizar progressivamente sem travar a UI.

## Technical Notes

- Integrar pacote STT on-device (candidato: `speech_to_text`) com locale `pt_BR`.
- Reusar `TextEditingController` do `ChatInputBar` / `ChatPage`.
- Não criar endpoint de áudio.

## Dependencies

### Requires
- None (permissão detalhada na story 002; estados na 003)

### Enables
- 003-voice-input-accessible-states
- 005 uso do chat por voz completo (com TTS)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Silêncio / sem reconhecimento | Mensagem amigável; campo/teclado ok |
| Envio enquanto ouvindo | Parar STT antes ou junto do envio; sem crash |

## Out of Scope

- Envio automático após STT
- iOS
- TTS do rascunho
