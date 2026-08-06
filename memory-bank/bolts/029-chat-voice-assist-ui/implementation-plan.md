---
stage: plan
bolt: 029-chat-voice-assist-ui
created: 2026-08-06T22:49:31.000Z
---

## Implementation Plan: chat-voice-assist-ui (TTS sanitization)

### Objective

Garantir que auto-TTS e “Ouvir” falem apenas texto limpo e útil em pt-BR,
pulem conteúdos não speakable e disparem **uma vez** por `messageId` de
resposta final — sem redesenhar UI, sem alterar STT/backend, preservando
o comportamento do bolt 028.

### Deliverables

- **Helper puro**: `sanitizeForTts` / `SpeakableText` em
  `features/chat/domain/tts_speakable_text.dart` (sem UI, sem plugins).
- **Integração**: `TtsPlaybackController.speak` e
  `onNewAssistantMessage` aplicam sanitização **antes** de chamar o
  serviço; skip silencioso (sem crash, sem estado `error` por conteúdo
  inválido).
- **Anti-duplicata auto-TTS**: rastrear `messageId` já falados
  automaticamente; rebuilds / re-notificações não relêem a mesma
  mensagem.
- **Guard de mensagem final**: só auto-speak quando a mensagem do
  assistente é completa (hoje: incremento de 1 mensagem final no
  listener; não falar em updates parciais do mesmo id se existirem).
- **Testes unitários** do helper (Markdown, URL, código, vazio, JSON,
  emoji-only) + testes do controller cobrindo skip e anti-duplicata.
- **Regressão**: suíte TTS do 028 continua passando.

### Dependencies

- **028-chat-voice-assist-ui** (completo): `TextToSpeechService`,
  `TtsPlaybackController`, auto-TTS no `ChatPage`, fakes de teste.
- Nenhuma nova dependência pub — só lógica Dart pura + integração no
  controller existente.
- STT (027) e API/backend: **fora de escopo / intactos**.

### Technical Approach

```text
features/chat/
  domain/
    tts_speakable_text.dart     # NOVO: sanitize + isSpeakable
  presentation/
    tts_playback_controller.dart  # speak/onNewAssistantMessage usam helper
  # ChatPage: só se precisar reforçar “mensagem final” / não tocar UI TTS
```

**Regras de sanitização (documentadas e testáveis):**

1. Remover blocos de código cercados (``` … ```) e trechos inline `` `...` ``.
2. Remover markup Markdown comum (`**`, `*`, `_`, `#`, links `[texto](url)` →
   manter `texto`).
3. URLs longas: omitir (não falar); domínio curto útil pode permanecer se
   aparecer como texto curto após limpeza — preferir omitir URLs
   `http(s)://...` inteiras.
4. Remover emojis/símbolos ruidosos em excesso; colapsar whitespace.
5. Após limpeza, se vazio → **não speakable** → skip.
6. Skip explícito (não speakable) quando o conteúdo for:
   - só whitespace / emoji
   - literal de erro técnico conhecido (alinhar a mensagens de erro do chat
     se houver padrão estável)
   - JSON puro (`{...}` / `[...]` parseável e sem prosa)
   - texto interno de sistema / IDs óbvios (heurística conservadora)

**Integração no controller:**

- `speak` / `onNewAssistantMessage`:
  `final speakable = sanitizeForTts(content); if (!speakable.isSpeakable) return;`
  depois `speak(speakable.text)`.
- Auto-TTS: set/lista de `_autoSpokenMessageIds`; se `messageId` já
  auto-falado → return; após iniciar speak com sucesso de elegibilidade,
  registrar id.
- Manual “Ouvir”: **pode** reler a mesma mensagem (replay); sanitiza, mas
  **não** bloqueia por anti-duplicata de auto-TTS.
- Mensagem parcial/streaming: se no futuro o mesmo `id` atualizar conteúdo,
  auto-TTS só reage a **nova** mensagem completa (listener por
  `length + 1`); não iniciar TTS enquanto `isSending` / placeholder de
  loading se aplicável. Sem streaming hoje → documentar guard e cobrir
  em teste do controller.

**Fora de escopo (bolt 030):**

- Lifecycle dispose / STT interrupt refinements
- Destaque visual / estados de playback avançados
- Redesign de controles TTS

### Acceptance Criteria

Story 006 — Sanitização / speakable:

- [ ] Resposta com Markdown/URLs longas/código/emojis ruidosos → TTS usa
      texto sanitizado legível em pt-BR.
- [ ] Conteúdo vazio, erro técnico literal, ID, JSON ou texto interno →
      auto-TTS e “Ouvir” não reproduzem (sem crash).
- [ ] Conteúdo ainda parcial/carregando → TTS não inicia.
- [ ] Mensagem final com auto-TTS ligado → leitura **uma vez** por
      `messageId` (rebuilds não duplicam).
- [ ] Testes unitários cobrem Markdown/URL/código/vazio/JSON (+ emoji-only).

Qualidade / bolt:

- [ ] Sem mudanças de API/backend; STT intacto.
- [ ] Sem novas deps pub.
- [ ] Regressão dos testes TTS do 028 passa.
- [ ] `flutter analyze` sem novos erros no escopo tocado.
