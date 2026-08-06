---
stage: plan
bolt: 027-chat-voice-assist-ui
created: 2026-07-24T19:15:19Z
---

## Implementation Plan: chat-voice-assist-ui (STT)

### Objective

Ativar o botão de voz do chat no Android com STT on-device (toque para
iniciar/parar), preenchendo o campo de mensagem existente sem enviar
automaticamente; cobrir permissão de microfone, indisponibilidade e estados
acessíveis, removendo o placeholder “em breve”.

### Deliverables

- **Dependência**: `speech_to_text` no `pubspec.yaml` (STT on-device Android).
- **Permissão Android**: `RECORD_AUDIO` em `AndroidManifest.xml` (main) +
  queries/`SpeechRecognizer` se exigido pelo plugin.
- **Domínio**: enum/estado `VoiceListeningState`
  (`idle` / `listening` / `unavailable` / `error`) e mensagens amigáveis.
- **Serviço STT**: wrapper testável sobre `speech_to_text` (init, start/stop,
  locale `pt_BR`, partial/final results, disponibilidade).
- **Controller / state**: Riverpod notifier (ou StatefulWidget local no
  `ChatInputBar`) que orquestra permissão → escuta → texto no
  `TextEditingController` sem chamar `onSend`.
- **UI**: atualizar `ChatInputBar` — remover SnackBar “em breve”; botão
  Gravar/Parar com ícone + label + Semantics; desabilitado quando
  `isSending` / offline / não-Android.
- **Fallbacks**: SnackBars (ou equivalente acessível) para permissão negada,
  permanentlyDenied (orientação a Ajustes) e STT indisponível.
- **Testes**: widget/unit com STT fake — idle/listening labels, sem auto-send,
  fallbacks; atualizar `chat_page_test` se necessário.

### Dependencies

- **`speech_to_text`** (pub.dev): SpeechRecognizer Android on-device; locale
  `pt_BR`. Escolhido por ser o candidato do unit-brief e cobrir partial results.
- **Permissão de microfone**: via o próprio plugin (ou `permission_handler` só
  se o fluxo do plugin for insuficiente) — preferir API do `speech_to_text`
  para não adicionar pacote extra sem necessidade.
- Reutiliza `ChatPage` / `ChatInputBar` / `TextEditingController` / fluxo
  `onSend` existente; `AppSpacing.minTouchTarget`; tema/brand.

### Technical Approach

Extender a feature `chat` (sem nova feature root), mantendo feature-based:

```text
features/chat/
  domain/
    voice_listening_state.dart     # estados + helpers de label/semantics
  data/
    speech_to_text_service.dart    # wrapper SpeechToText (port/impl)
  presentation/
    voice_input_controller.dart    # Riverpod: idle/listening/error/unavailable
    widgets/
      chat_input_bar.dart          # botão Gravar/Parar + feedback
    chat_page.dart                 # wiring: parar STT ao enviar se ouvindo
```

- **Toggle toque**: idle → startListening; listening → stopListening e aplica
  texto final (e parciais, se disponíveis) no controller.
- **Sem auto-send**: só atualiza texto; envio continua no botão/teclado atual.
- **Envio enquanto ouvindo**: `ChatPage._sendMessage` (ou `ChatInputBar`)
  chama stop antes/junto do send para evitar crash.
- **Plataforma**: `Platform.isAndroid` (ou `defaultTargetPlatform`) — em iOS/
  outras, botão desabilitado ou mensagem “disponível em breve no Android”.
- **Acessibilidade**: Semantics “Gravar mensagem de voz” / “Parar gravação”;
  ícone `mic` ↔ `stop` (ou `mic_off`); altura ≥ `AppSpacing.minTouchTarget`;
  feedback de erro não só por cor.
- **Silêncio / sem reconhecimento**: mensagem amigável; teclado e campo
  permanecem usáveis.
- **Fora de escopo deste bolt**: TTS, preferência auto-TTS, iOS STT, áudio no
  backend.

### Acceptance Criteria

Story 001 — STT toque-iniciar/parar:
- [ ] Com STT disponível e permissão ok, toque em Gravar entra em modo ouvindo.
- [ ] Novo toque para a escuta e o texto reconhecido aparece no campo.
- [ ] Texto via STT **não** envia automaticamente.
- [ ] Enviar com texto STT usa o mesmo fluxo existente do chat.
- [ ] Texto parcial (se suportado) atualiza o campo sem travar a UI.

Story 002 — Permissão e fallbacks:
- [ ] Primeira gravação sem permissão dispara pedido de microfone.
- [ ] Permissão negada → mensagem simples; teclado disponível.
- [ ] STT indisponível → aviso sem crash.
- [ ] Não-Android → botão desabilitado ou “em breve” sem quebrar UI.
- [ ] `RECORD_AUDIO` declarado no AndroidManifest.

Story 003 — Estados acessíveis:
- [ ] SnackBar “Gravação de voz em breve…” removido no fluxo Android real.
- [ ] Modo ouvindo: label/ícone/semantics de **parar**.
- [ ] Modo ocioso (Android ok): semantics de **gravar**/iniciar.
- [ ] Erro/indisponível: feedback textual claro e acessível.
- [ ] Alvos de toque ≥ `AppSpacing.minTouchTarget`.

Qualidade / bolt:
- [ ] `flutter analyze` sem novos erros.
- [ ] Sem endpoint de áudio; áudio não sai do dispositivo.
- [ ] Testes com fake STT cobrindo estados principais.
