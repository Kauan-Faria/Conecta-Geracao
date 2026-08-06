---
stage: plan
bolt: 030-chat-voice-assist-ui
created: 2026-08-06T22:55:30.000Z
---

## Implementation Plan: chat-voice-assist-ui (TTS lifecycle + controls)

### Objective

Completar o ciclo de vida do TTS e os controles/estados visuais no Android:
interromper leitura ao falar (STT), enviar, sair da tela ou trocar de mensagem;
`dispose` seguro; parâmetros de voz adequados; estados claros e destaque da
mensagem ativa — estendendo 028/029 sem rewrite e sem quebrar STT.

### Deliverables

- **Porta TTS estendida**: `dispose()` (+ `pause()` só se confiável no Android;
  senão omitir da UI e documentar).
- **Parâmetros de voz**: rate / volume / pitch em `pt-BR` no `initialize`
  (baixa alfabetização digital — fala mais lenta e clara).
- **Lifecycle wiring**:
  - início de STT → `stopIfSpeaking`
  - envio (já existe) permanece
  - `ChatPage.dispose` / saída da tela → stop + dispose seguro do engine
  - troca de mensagem via `speak` (já para anterior) permanece
- **Estados de domínio** (`TtsPlaybackStatus`): `idle`, `loading`, `speaking`,
  `stopped`, `error` (+ `paused` **somente** se pause for confiável).
- **Controles UI**: ouvir / parar / ouvir de novo (mesmo botão com rótulos
  semânticos claros); highlight visual da bolha falando; sem controles em
  mensagens do usuário.
- **Copy da preferência**: rótulo TalkBack alinhado a “Ler respostas em voz alta”
  (ligado/desligado).
- **Manifest**: revisar se TTS exige algo além de `RECORD_AUDIO` (STT); aplicar
  só o necessário e documentar no walkthrough.
- **Testes**: estados/lifecycle do controller + UI bolha/header; regressão
  027/028/029.

### Dependencies

- **028-chat-voice-assist-ui** (completo): serviço, controller, bolha, preferência.
- **029-chat-voice-assist-ui** (completo): sanitização / anti-duplicata.
- **027** STT: apenas conectar interrupção no início da escuta — não refazer.
- Nenhuma nova dependência pub esperada (`flutter_tts` já presente).
- API/backend: fora de escopo.

### Technical Approach

```text
features/chat/
  data/
    text_to_speech_service.dart   # +dispose; rate/volume/pitch; ?pause
  domain/
    tts_playback_state.dart       # enum + labels (loading/stopped/; copy auto-TTS)
  presentation/
    tts_playback_controller.dart  # loading/stopped; dispose; guards pós-dispose
    voice_input_controller.dart   # ou ChatPage: stop TTS ao startListening
    chat_page.dart                # dispose → stop+dispose TTS
    widgets/
      chat_message_bubble.dart    # highlight + labels por status
      chat_hero_header.dart       # copy “Ler respostas em voz alta”
```

**Decisão pause (pré-definida no plan):**

- Avaliar `FlutterTts.pause` / resume no Android durante implement.
- Se instável ou inconsistente → **não** expor `paused` na UI; só stop.
- Documentar a escolha no `implementation-walkthrough.md`.

**Lifecycle / dispose:**

1. Estender `TextToSpeechService` com `dispose()` que limpa handlers e libera
   o engine (sem nova instância de `FlutterTts` por rebuild — provider único).
2. `TtsPlaybackController.disposePlayback()` (ou equivalente): incrementa
   generation, `stop()`, `dispose()` do serviço, marca disposed; callbacks
   ignoram updates se disposed / generation desatualizada.
3. `ChatPage.dispose`: chamar stop+dispose do controller (além dos controllers
   de texto/scroll).
4. `VoiceInputController.startListening` (ou ponto de entrada equivalente):
   `tts.stopIfSpeaking()` **antes** de abrir o mic — evita áudio sobreposto.
5. Envio: manter `stopIfSpeaking` já existente.

**Estados (FR-9):**

| Status   | Quando |
|----------|--------|
| idle     | sem leitura ativa |
| loading  | init / preparando speak (curto) |
| speaking | engine falando |
| stopped  | usuário parou explicitamente (ou mapear para idle se preferir alias) |
| error    | init/speak falhou — UI amigável, texto ok |
| paused   | **só se** pause confiável |

- Manter aliases/helpers (`isSpeaking`, `isSpeakingMessage`) para não quebrar
  consumidores do 028.
- Após stop explícito: preferir `stopped` breve ou `idle` com
  `speakingMessageId` limpo — escolher uma convenção e testar.

**UI / a11y:**

- Bolha assistente: botão Ouvir ↔ Parar; após parado, “Ouvir” = replay do início.
- Highlight: reforçar borda/fundo quando `isSpeakingMessage(id)`.
- Preferência: semantics ≈ “Ler respostas em voz alta, ligado/desligado”
  (ajustar constantes existentes sem redesign do header).
- Mensagens do usuário: sem controles TTS.

**Manifest:**

- TTS on-device via `flutter_tts` tipicamente **não** exige permissão extra
  além do que já existe; confirmar e, se Android 11+ precisar de `<queries>`
  para TTS, adicionar só o intent necessário. Não remover `RECORD_AUDIO`.

**Fora de escopo:**

- iOS / cloud TTS / seek / escolha de voz na UI
- Alterar pipeline de envio ou contratos de API
- Refazer STT ou sanitização

### Acceptance Criteria

Story 007 — Lifecycle:

- [ ] TTS falando + início STT → leitura interrompe imediatamente.
- [ ] TTS falando + envio → leitura interrompe (comportamento atual preservado).
- [ ] TTS falando + sair da tela / dispose → para; sem callback pós-dispose.
- [ ] `dispose()` libera engine; sem nova `FlutterTts` a cada rebuild.
- [ ] Falha init/speak → tela não cai; texto utilizável.
- [ ] Manifest revisado/documentado; só permissões necessárias.
- [ ] rate/volume/pitch configurados em `pt-BR` no init.

Story 008 — Controles / estados:

- [ ] Controles ouvir / parar / replay com rótulos claros.
- [ ] Destaque visual na mensagem sendo falada.
- [ ] Estados: idle, loading, speaking, stopped, error (+ paused se aplicável).
- [ ] Toggle preferência TalkBack: “Ler respostas em voz alta” ligado/desligado.
- [ ] Bolhas do usuário sem controles TTS nem auto-leitura.

Qualidade / bolt:

- [ ] Sem mudanças de API/backend; STT não reescrito.
- [ ] Sem novas deps pub (salvo descoberta bloqueante — documentar).
- [ ] Regressão testes 027/028/029 + novos testes de lifecycle/estados.
- [ ] `flutter analyze` sem novos erros no escopo tocado.
