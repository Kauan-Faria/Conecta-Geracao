---
id: 006-tts-speakable-text-sanitization
unit: 001-chat-voice-assist-ui
intent: 006-chat-voice-assist
status: complete
priority: must
created: 2026-08-06T22:45:00.000Z
assigned_bolt: 029-chat-voice-assist-ui
implemented: true
---

# Story: 006-tts-speakable-text-sanitization

## User Story

**As a** usuário que ouve as respostas da IA
**I want** que o app limpe o texto antes de falar e ignore conteúdos inválidos
**So that** eu ouça só a orientação útil, sem Markdown, URLs, códigos ou erros técnicos

## Acceptance Criteria

- [ ] **Given** uma resposta com Markdown/URLs longas/blocos de código/emojis ruidosos, **When** o TTS fala, **Then** o áudio usa texto sanitizado legível em pt-BR.
- [ ] **Given** conteúdo vazio, erro técnico literal, ID, JSON ou texto interno do sistema, **When** auto-TTS ou “Ouvir” é acionado, **Then** nada é reproduzido (sem crash).
- [ ] **Given** resposta ainda carregando ou parcial (streaming), **When** o conteúdo ainda não está final, **Then** o TTS **não** inicia.
- [ ] **Given** a mensagem final do assistente completa, **When** auto-TTS está ligado, **Then** a leitura dispara **uma única vez** por `messageId` (rebuilds não duplicam).
- [ ] **Given** a sanitização, **When** rodo testes unitários, **Then** casos de Markdown/URL/código/vazio/JSON estão cobertos.

## Technical Notes

- Extrair helper puro (ex.: `tts_speakable_text.dart` em `domain/` ou `data/`) — sem UI.
- Integrar no `TtsPlaybackController.speak` / `onNewAssistantMessage` **antes** de chamar o serviço.
- Reusar detecção de mensagem final já existente no chat; se houver streaming, só falar no evento de mensagem completa.
- Não alterar API/backend; não mudar contrato de mensagens.

## Dependencies

### Requires
- 004-tts-assistant-replies (já implementada no bolt 028)

### Enables
- 007-tts-playback-lifecycle-guards (fala só conteúdo limpo)
- 008-tts-controls-and-playback-states

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Texto só com emoji/símbolos | Após sanitizar, se vazio → não fala |
| Resposta com link curto útil | Pode falar domínio curto ou omitir URL longa (documentar regra no plan) |
| Duas respostas finais rápidas | Cancela anterior; sanitiza e fala a nova |

## Out of Scope

- Tradução
- Escolha de voz do sistema
- Alterar formatação visual do Markdown no chat
