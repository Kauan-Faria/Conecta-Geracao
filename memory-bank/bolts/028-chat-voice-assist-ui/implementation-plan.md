---
stage: plan
bolt: 028-chat-voice-assist-ui
created: 2026-08-06T21:51:19Z
---

## Implementation Plan: chat-voice-assist-ui (TTS)

### Objective

Adicionar TTS on-device no chat Android para ler respostas do assistente em
pt-BR, com parar/ouvir novamente, interrupção previsível ao enviar, e
preferência persistida de auto-leitura (ligada por padrão), sem quebrar o
chat por texto se o engine falhar.

### Deliverables

- **Dependência**: `flutter_tts` no `pubspec.yaml` (TTS on-device Android).
- **Domínio**: enum/estado `TtsPlaybackState`
  (`idle` / `speaking` / `error`) + mensagens/labels acessíveis.
- **Serviço TTS**: porta testável + adapter sobre `flutter_tts`
  (init, speak/stop, locale `pt-BR`, callbacks de conclusão/erro).
- **Preferência**: repositório local `chat_auto_tts_enabled` via
  `shared_preferences` (já no projeto); padrão `true` quando chave ausente.
- **Controller / state**: Riverpod notifier que orquestra auto-speak,
  stop/replay, preferência e falhas sem derrubar o chat.
- **UI**:
  - Controles de **parar / ouvir novamente** junto à última (ou
    corrente) resposta do assistente em `ChatMessageBubble` (menos
    invasivo que poluir a barra de input já ocupada pelo mic).
  - Toggle de auto-TTS no `AppBar`/ações do `ChatPage` com Semantics
    claros (ligado/desligado).
- **Integração**: `ChatPage` observa novas mensagens do assistente e
  dispara auto-TTS; `_sendMessage` interrompe TTS em curso antes/junto
  do envio.
- **Testes**: unit/widget com TTS fake + prefs mock — auto on/off,
  stop/replay, interrupt on send, default ligado, falha sem quebrar UI.

### Dependencies

- **`flutter_tts`** (pub.dev): TextToSpeech Android on-device; locale
  `pt-BR`. Candidato das stories e do unit-brief.
- **`shared_preferences`** (já presente): chave estável
  `chat_auto_tts_enabled`.
- Reutiliza `ChatPage` / `ChatMessageBubble` / `chatControllerProvider` /
  padrão de porta+fake do bolt 027 (`SpeechRecognitionService`).
- Dependência de bolt: **027 completo** (STT estável na mesma área).

### Technical Approach

Extender a feature `chat`, espelhando a estrutura STT do 027:

```text
features/chat/
  domain/
    tts_playback_state.dart          # estados + labels/mensagens
  data/
    text_to_speech_service.dart      # porta TTS + adapter flutter_tts
    auto_tts_prefs_repository.dart   # load/save bool (default true)
  presentation/
    tts_playback_controller.dart     # Riverpod: speak/stop/replay/auto
    widgets/
      chat_message_bubble.dart       # ações ouvir/parar em respostas IA
    chat_page.dart                   # auto-TTS + stop ao enviar + toggle
```

- **Auto-TTS**: ao detectar nova mensagem `MessageRole.assistant` (após
  envio / resposta), se preferência ligada e plataforma Android →
  `speak(content)`. Não ler mensagens do usuário.
- **Concorrência**: se já estiver falando, cancela a leitura anterior
  antes de iniciar a nova (respostas rápidas / nova mensagem).
- **Envio**: `_sendMessage` chama `stopSpeaking` de forma previsível
  (documentar: sempre interrompe TTS em curso ao enviar).
- **Replay**: botão “ouvir novamente” na última resposta do assistente
  (ou na que está em foco) chama `speak` do mesmo texto.
- **Stop**: botão/ícone de parar durante `speaking` interrompe
  imediatamente.
- **Preferência**: toggle persiste imediatamente; desligar durante
  leitura interrompe a atual; “ouvir” manual permanece disponível.
- **Plataforma**: Android-first (como STT); iOS/outras degradam sem
  crash — controles desabilitados ou ocultos com feedback amigável se
  tocados.
- **Falha TTS**: estado `error` + SnackBar/mensagem amigável; bolhas e
  input continuam usáveis.
- **Acessibilidade**: Semantics “Ouvir resposta”, “Parar leitura”,
  “Leitura automática ligada/desligada”; alvos ≥ `AppSpacing.minTouchTarget`.
- **Fora de escopo**: TTS do rascunho STT; escolha de voz/timbre; iOS;
  sync de preferência com backend.

### Acceptance Criteria

Story 004 — TTS das respostas:
- [ ] Nova mensagem do assistente com auto-TTS ligado inicia leitura pt-BR.
- [ ] Parar interrompe a leitura imediatamente.
- [ ] Ouvir novamente recomeça a última (ou selecionada) resposta do assistente.
- [ ] Enviar nova mensagem interrompe TTS em curso de forma previsível.
- [ ] Falha do engine TTS → chat por texto ok + feedback amigável.
- [ ] Mensagens do usuário não são lidas por padrão.
- [ ] Resposta longa não trava a UI; duas respostas rápidas cancelam a anterior.

Story 005 — Preferência auto-TTS:
- [ ] Sem preferência salva → auto-TTS **ligado** por padrão.
- [ ] Toggle desligado → novas respostas não leem sozinhas; “ouvir” manual ok.
- [ ] Preferência persiste entre sessões (`shared_preferences`).
- [ ] TalkBack: label semântico claro ligado/desligado.
- [ ] Desligar durante leitura interrompe a atual.

Qualidade / bolt:
- [ ] `flutter analyze` sem novos erros.
- [ ] Sem áudio no backend; TTS on-device.
- [ ] Testes com fake TTS + prefs cobrindo fluxos principais.
