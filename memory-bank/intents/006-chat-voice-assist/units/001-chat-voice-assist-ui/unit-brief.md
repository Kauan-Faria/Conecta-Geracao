---
unit: 001-chat-voice-assist-ui
intent: 006-chat-voice-assist
phase: inception
status: complete
unit_type: frontend
default_bolt_type: simple-construction-bolt
created: 2026-07-24T19:12:00.000Z
updated: 2026-08-06T22:45:00.000Z
---

# Unit Brief: Chat Voice Assist UI

## Purpose

Tornar o chat utilizável por voz no Android: o usuário fala para preencher a
mensagem e ouve as respostas da IA, sem depender de ler/escrever texto.

## Scope

### In Scope
- STT on-device (toque para iniciar / toque para parar) preenchendo o campo.
- Permissão de microfone e fallbacks amigáveis.
- Estados acessíveis do botão Gravar (remover placeholder “em breve”).
- TTS das respostas do assistente (parar, ouvir de novo; auto por padrão).
- Preferência persistida de auto-TTS.
- Integração com o envio de texto existente (sem áudio no backend).
- Sanitização de texto speakable e skip de conteúdos inválidos.
- Interrupções de ciclo de vida (STT, envio, sair da tela, dispose).
- Estados de playback e destaque visual da mensagem falada.

### Out of Scope
- iOS
- Web Speech API / Flutter Web
- Cloud STT/TTS
- Envio/armazenamento de áudio
- TTS do rascunho do STT antes do envio
- Redesign amplo do chat
- Alterar contratos da API/backend
- Refazer STT já entregue

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Entrada por voz (STT) no chat — Android | Must |
| FR-2 | Permissão de microfone e indisponibilidade | Must |
| FR-3 | Leitura em voz alta das respostas da IA (TTS) | Must |
| FR-4 | Estados e feedback acessíveis na barra de input | Must |
| FR-5 | Integração com o fluxo de envio existente | Must |
| FR-6 | Preferência de leitura automática | Should |
| FR-7 | Sanitização e conteúdo elegível para TTS | Must |
| FR-8 | Ciclo de vida e interrupções do TTS | Must |
| FR-9 | Estados e controles visuais de reprodução | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| VoiceListeningState | Estado da escuta STT | idle / listening / unavailable / error |
| TtsPlaybackState | Estado da leitura | idle / loading / speaking / paused? / stopped / error |
| SpeakableText | Texto sanitizado elegível a TTS | source → cleaned / skip |
| AutoTtsPreference | Preferência local de auto-leitura | enabled: bool |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| startListening | Inicia STT | locale pt-BR | partial/final transcript |
| stopListening | Para STT e aplica texto no campo | — | texto final |
| sanitizeForTts | Normaliza/valida texto | raw text | speakable or skip |
| speak | Lê texto via TTS | texto, locale | playback |
| stopSpeaking | Interrompe TTS | — | — |
| pauseSpeaking | Pausa se suportado | — | — |
| disposeTts | Libera engine/listeners | — | — |
| load/saveAutoTts | Persistência da preferência | bool | bool |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 8 |
| Must Have | 7 |
| Should Have | 1 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-stt-tap-to-dictate | STT toque-iniciar/parar → preenche campo | Must | Implemented (027) |
| 002-microphone-permission-fallback | Permissão e indisponibilidade | Must | Implemented (027) |
| 003-voice-input-accessible-states | Estados acessíveis do botão de voz | Must | Implemented (027) |
| 004-tts-assistant-replies | TTS das respostas do assistente | Must | Implemented (028) |
| 005-auto-tts-preference | Preferência de auto-TTS | Should | Implemented (028) |
| 006-tts-speakable-text-sanitization | Sanitização e conteúdo elegível | Must | Implemented (029) |
| 007-tts-playback-lifecycle-guards | Interrupções e dispose do TTS | Must | Planned (030) |
| 008-tts-controls-and-playback-states | Estados e controles visuais | Must | Planned (030) |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| Chat UI existente (001-digital-guidance) | Reutiliza ChatPage / ChatInputBar / envio |

### Depended By
| Unit | Reason |
|------|--------|
| — | — |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Android SpeechRecognizer (pacote STT) | Ditado pt-BR | Médio (qualidade on-device) |
| Android TextToSpeech (`flutter_tts`) | Leitura pt-BR | Baixo |
| SharedPreferences (já no app) | Preferência auto-TTS | Baixo |

---

## Technical Context

### Suggested Technology
- Flutter + Riverpod (padrões do app).
- `speech_to_text` + `flutter_tts` (já no projeto após 027/028).
- Feature: `lib/features/chat/...` (domain/data/presentation conforme padrão local).

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| ChatInputBar / ChatPage | UI | Flutter widgets |
| Conversations API client | Texto | HTTP (inalterado) |
| Android permissions | Manifest + runtime | RECORD_AUDIO (+ revisar TTS) |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| auto_tts_enabled | Preferência local | 1 flag | Até limpar dados do app |
| Áudio | Não armazenado | — | — |

---

## Constraints

- MVP só Android; iOS degradado sem crash.
- Áudio não sai do dispositivo.
- Envio permanece manual após STT.
- Auto-TTS ligado por padrão no primeiro uso.
- Delta 029/030 **não** quebra STT/TTS já entregues — estende.

---

## Success Criteria

### Functional
- [x] No Android, mic inicia/para por toque e preenche o campo.
- [x] Permissão negada / STT indisponível → mensagem clara + teclado ok.
- [x] Placeholder “em breve” removido; estados TalkBack corretos.
- [x] Respostas da IA podem ser ouvidas; parar e repetir funcionam.
- [x] Preferência auto-TTS persiste.
- [x] Texto sanitizado; skip de não-speakable; sem duplicata/parcial.
- [ ] Interrompe em STT/envio/sair; dispose seguro.
- [ ] Estados e controles visuais alinhados a FR-9.

### Non-Functional
- [x] UI não trava durante STT/TTS.
- [ ] Sem novos erros no `flutter analyze` após 029/030.

### Quality
- [ ] Critérios de aceite das 8 stories atendidos.

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective | Status |
|------|------|---------|-----------|--------|
| 027-chat-voice-assist-ui | simple-construction-bolt | 001, 002, 003 | STT + permissão + estados do mic | Complete |
| 028-chat-voice-assist-ui | simple-construction-bolt | 004, 005 | TTS + preferência auto-leitura | Complete |
| 029-chat-voice-assist-ui | simple-construction-bolt | 006 | Sanitização / speakable text | Complete |
| 030-chat-voice-assist-ui | simple-construction-bolt | 007, 008 | Lifecycle + estados/controles | Planned |

---

## Notes

Sem unit de backend. Ordem: STT → TTS base → sanitização → lifecycle/UI.
Bolts 029 e 030 são **delta incremental** sobre 028, não rewrite.
