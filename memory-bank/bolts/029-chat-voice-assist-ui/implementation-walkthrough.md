---
stage: implement
bolt: 029-chat-voice-assist-ui
created: 2026-08-06T22:50:40.000Z
---

## Implementation Walkthrough: chat-voice-assist-ui (TTS sanitization)

### Summary

Adicionado helper puro de texto speakable e integrado no caminho de
fala do chat: auto-TTS e “Ouvir” só reproduzem conteúdo limpo e útil,
com skip silencioso de inválidos e anti-duplicata por messageId no
auto-TTS. STT, backend e UI de controles permanecem intactos.

### Structure Overview

A sanitização vive no domínio da feature chat; o controller de
playback aplica o helper antes do serviço TTS e guarda ids já
auto-lidos. O ChatPage passa a sinalizar mensagem final ao disparar
auto-TTS. Sem novas dependências pub.

### Completed Work

- [x] `apps/mobile/lib/features/chat/domain/tts_speakable_text.dart` - Sanitiza Markdown/código/URLs/emojis e classifica speakable vs skip
- [x] `apps/mobile/lib/features/chat/presentation/tts_playback_controller.dart` - Aplica sanitização em speak/auto-TTS; anti-duplicata e guard isFinal
- [x] `apps/mobile/lib/features/chat/presentation/chat_page.dart` - Passa isFinal ao auto-TTS (só resposta completa)

### Key Decisions

- **Helper puro no domain**: facilita testes unitários sem plugins/UI e
  alinha ao conceito SpeakableText do unit-brief.
- **Anti-duplicata só no auto-TTS**: “Ouvir” manual continua podendo
  reler a mesma mensagem (replay do 028).
- **Skip silencioso**: conteúdo inválido não gera estado `error` — evita
  SnackBars espúrios; falhas reais do engine TTS do 028 preservadas.
- **Sem streaming hoje**: `isFinal` / incremento de mensagem cobrem o
  guard; lifecycle fino fica no bolt 030.

### Deviations from Plan

None

### Dependencies Added

- Nenhum pacote novo

### Developer Notes

- Regras de URL: `http(s)://...` são omitidas por completo na fala.
- JSON/IDs/erro técnico usam heurísticas conservadoras — ajustar se o
  backend passar a emitir formatos específicos.
- Testes do helper e regressão do controller ficam para o Stage 3.
