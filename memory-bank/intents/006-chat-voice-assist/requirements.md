---
intent: 006-chat-voice-assist
phase: inception
status: complete
created: 2026-07-24T19:04:00.000Z
updated: 2026-08-06T22:45:00.000Z
---

# Requirements: Assistência por voz no chat

## Intent Overview

Ativar o botão de voz já presente na barra de input do chat e permitir que o
usuário **fale** para preencher a mensagem e **ouça** as respostas da IA. O
objetivo é atender pessoas com baixa ou nenhuma alfabetização, que podem não
conseguir ler o texto na tela e dependem de fala e escuta.

No MVP: **speech-to-text (STT)** e **text-to-speech (TTS)** on-device no
**Android**, integrados ao fluxo de chat existente (sem envio de áudio ao
backend).

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Usuário consegue enviar dúvida sem digitar | Completa STT → confirma texto → envia mensagem | Must |
| Usuário consegue acompanhar a resposta sem ler | TTS lê a última resposta do assistente de forma inteligível | Must |
| Remover placeholder “em breve” do mic | Botão funcional no Android com feedback claro de estados | Must |
| Manter custo zero de API de voz no MVP | STT/TTS on-device; sem provedor cloud de áudio | Must |

---

## Functional Requirements

### FR-1: Entrada por voz (STT) no chat — Android
- **Description**: O botão **Gravar** inicia/para o reconhecimento de fala
  on-device. O texto reconhecido é inserido no campo de mensagem para o usuário
  revisar e enviar.
- **Acceptance Criteria**:
  - No Android, tocar em **Gravar** inicia a escuta (após permissão de microfone
    concedida).
  - Tocar novamente (ou em controle equivalente de “parar”) encerra a escuta.
  - O texto reconhecido preenche o `TextField` existente; o envio **não** é
    automático.
  - Durante a escuta, o botão/estado visual deixa claro que está gravando
    (ex.: rótulo/ícone alterados).
  - Se o reconhecimento falhar ou não houver fala, mostra mensagem amigável e
    o campo permanece utilizável via teclado.
- **Priority**: Must

### FR-2: Permissão de microfone e indisponibilidade
- **Description**: Solicitar e tratar permissão de microfone; degradar com
  clareza quando STT não estiver disponível.
- **Acceptance Criteria**:
  - Na primeira tentativa de gravar, o app pede permissão de microfone se ainda
    não concedida.
  - Se a permissão for negada, explica em linguagem simples e mantém o teclado
    como alternativa.
  - Em dispositivo/API level sem suporte a STT, informa indisponibilidade sem
    crash.
  - Em builds/targets que não sejam Android (ex.: iOS neste intent), o botão
    permanece desabilitado ou com mensagem de “disponível em breve no Android”,
    sem quebrar a UI.
- **Priority**: Must

### FR-3: Leitura em voz alta das respostas da IA (TTS)
- **Description**: Após uma nova mensagem do assistente, o app oferece (e no MVP
  inicia de forma acessível) a leitura em voz alta do conteúdo em português.
- **Acceptance Criteria**:
  - Quando chega uma nova resposta do assistente, o usuário consegue ouvi-la
    via TTS on-device em pt-BR.
  - Existe controle explícito para **parar** a leitura em andamento.
  - Existe controle para **ouvir novamente** a última resposta do assistente
    (ou a mensagem selecionada, se a UI já permitir seleção).
  - TTS não bloqueia o envio de novas mensagens; se o usuário enviar outra
    mensagem, a leitura em curso é interrompida ou substituída de forma
    previsível (documentar o comportamento escolhido na implementação).
  - Falha de TTS não impede o uso do chat por texto.
- **Priority**: Must

### FR-4: Estados e feedback acessíveis na barra de input
- **Description**: Substituir o SnackBar “em breve” por estados reais
  (ocioso / ouvindo / processando / erro), com rótulos semânticos adequados a
  TalkBack.
- **Acceptance Criteria**:
  - Removido o fluxo placeholder que só mostra “Gravação de voz em breve…”.
  - `Semantics` / labels refletem o estado atual (ex.: “Parar gravação” quando
    ouvindo).
  - Alvos de toque respeitam o mínimo do design system do app.
  - Feedback visual/sonoro (ou haptic leve, se já usado no app) indica início e
    fim da escuta sem depender só de cor.
- **Priority**: Must

### FR-5: Integração com o fluxo de envio existente
- **Description**: O texto proveniente do STT segue o mesmo caminho de envio
  (guest/autenticado, offline cache, etc.) já implementado no chat.
- **Acceptance Criteria**:
  - Enviar após STT usa o mesmo `onSend` / controllers atuais.
  - Não há novo endpoint de áudio no backend neste intent.
  - Comportamento offline/erros de rede do chat permanece inalterado.
- **Priority**: Must

### FR-6: Preferência de leitura automática (opcional no MVP)
- **Description**: Permitir que o usuário desative a leitura automática das
  respostas, mantendo o botão de “ouvir” disponível.
- **Acceptance Criteria**:
  - Há forma simples de ligar/desligar auto-TTS (toggle na tela de chat ou em
    configurações, o que for menos invasivo).
  - Rótulo compreensível (ex.: “Ler respostas em voz alta”).
  - A preferência persiste entre sessões no dispositivo.
- **Priority**: Should

### FR-7: Sanitização e conteúdo elegível para TTS
- **Description**: Antes de falar, normalizar o texto da resposta da IA e
  recusar conteúdos que não devem ser lidos em voz alta.
- **Acceptance Criteria**:
  - Remove ou trata Markdown, URLs longas, blocos de código, caracteres
    especiais desnecessários e emojis que prejudiquem a leitura.
  - Não reproduz mensagens vazias, erros técnicos literais, IDs, JSON,
    Markdown cru ou conteúdos internos do sistema.
  - Se a resposta chegar por streaming/parcial, o TTS inicia **somente** após
    a mensagem final estar completa (não lê enquanto carrega).
  - Auto-TTS dispara **no máximo uma vez** por resposta (sem duplicar em
    rebuilds).
  - Sanitização é testável unitariamente e isolada do widget.
- **Priority**: Must

### FR-8: Ciclo de vida e interrupções do TTS
- **Description**: Garantir interrupção previsível e uma única reprodução
  ativa, sem acoplar `FlutterTts` ao widget e sem vazar listeners.
- **Acceptance Criteria**:
  - Serviço TTS expõe `initialize()`, `speak()`, `stop()`, `dispose()` e
    `pause()` quando suportado de forma confiável no Android.
  - Antes de nova fala, interrompe qualquer reprodução anterior (nunca duas
    respostas simultâneas).
  - Interrompe ao: usuário começar a falar (STT), enviar outra pergunta,
    pressionar parar, sair da tela, iniciar outra mensagem.
  - Configura velocidade, volume e tom adequados a baixa alfabetização digital
    (locale `pt-BR`).
  - Falhas de init/reprodução não derrubam a tela; sem `setState` após dispose;
    cancela callbacks/listeners ao sair.
  - Uma instância estável do engine (sem recriar `FlutterTts` a cada rebuild).
  - Verificar `AndroidManifest` / permissões extras necessárias ao TTS (além
    do microfone já usado pelo STT).
- **Priority**: Must

### FR-9: Estados e controles visuais de reprodução
- **Description**: Expor estados claros de playback e controles por mensagem
  da IA (ouvir / parar / reproduzir novamente), destacando qual mensagem está
  sendo falada.
- **Acceptance Criteria**:
  - Estados explícitos no domínio: `idle`, `loading`, `speaking`, `paused`
    (se pause confiável), `stopped`, `error` (mapear UI de forma previsível).
  - Controles na mensagem da IA: ouvir, parar, reproduzir novamente.
  - Feedback visual de qual mensagem está ativa na leitura.
  - Não lê mensagens do usuário; abstração via serviço/controller/provider
    (padrão atual Riverpod), sem `FlutterTts` no widget.
- **Priority**: Must

---

## Non-Functional Requirements

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| Início da escuta após toque (permissão já concedida) | Tempo até estado “ouvindo” | < 1 s na maioria dos dispositivos alvo |
| Latência percebida do STT parcial | Texto parcial no campo | Conforme engine on-device; UI não trava |
| Início do TTS após resposta da IA | Tempo até primeira fala | < 1,5 s após mensagem renderizada |

### Usabilidade / Acessibilidade
| Requirement | Metric | Target |
|-------------|--------|--------|
| Público-alvo | Alfabetização baixa/nula | Fluxo utilizável só com fala + escuta + poucos toques |
| Idioma | STT e TTS | Português (Brasil) |
| TalkBack | Labels de mic e controles TTS | Sempre atualizados ao estado |
| Área de toque | Controles de voz | ≥ `AppSpacing.minTouchTarget` |

### Compatibilidade
| Requirement | Metric | Target |
|-------------|--------|--------|
| Plataforma MVP | SO suportado | Android only |
| iOS | Neste intent | Explicitamente fora; UI não quebra |
| Rede | STT/TTS | Funcionam offline (engines on-device), independente da API de chat |

### Privacidade / Segurança
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Áudio | Não enviado ao backend no MVP | Processamento on-device |
| Texto | Mesmas regras LGPD do chat | Conteúdo falado vira texto no mesmo pipeline |
| Permissões | Microfone só sob demanda | Justificativa clara na store/manifest |

### Reliability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Falha de STT/TTS | Impacto no chat | Degradação graciosa; teclado e leitura visual continuam |
| Cancelamento | Interromper STT/TTS | Sempre possível com um toque |

---

## Constraints

### Technical Constraints

**Project-wide standards**: carregados pelo Construction Agent a partir de
`memory-bank/standards/`.

**Intent-specific constraints**:
- MVP apenas **Android**.
- STT/TTS **on-device** (ex.: `speech_to_text` + `flutter_tts` ou equivalente
  mantido); sem Web Speech API; sem cloud STT/TTS no MVP.
- Não enviar arquivos de áudio à API; só texto, como hoje.
- Reutilizar `ChatInputBar` / tela de chat existentes; evitar redesign amplo.

### Business Constraints
- Custo zero de provedor de voz no MVP.
- Público priorizado: usuários que falam/ouvem melhor do que leem/escrevem.

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| Engines STT/TTS do Android em pt-BR são suficientes para o MVP | Acurácia baixa frustra o usuário | Avaliar cloud STT em intent futuro |
| Usuário confirma o texto no campo antes de enviar | Usuário pode não conseguir ler o texto preenchido | TTS do próprio rascunho (Could) ou confirmação por áudio em evolução |
| Auto-TTS das respostas ajuda mais do que atrapalha | Pode incomodar em público | FR-6 toggle de auto-leitura |
| Permissão de microfone será concedida na maioria dos testes | Negação bloqueia STT | Mensagens claras + teclado |

---

## Out of Scope (Won't neste intent)

- iOS (STT/TTS nativos e permissões)
- Web Speech API / Flutter Web
- Envio de áudio bruto ao backend ou armazenamento de gravações
- Identificação biométrica por voz
- Tradução entre idiomas
- Ditado contínuo sem toque de parar
- Redesign completo da UI do chat além dos controles de voz/TTS
- Alterar contratos da API / backend (IA continua retornando texto)
- Substituir ou refazer o STT já entregue (bolts 027)

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| Auto-TTS ligado por padrão no primeiro uso? | Product | Checkpoint 2 | **Resolvido**: sim, com toggle (FR-6) |
| TTS do rascunho STT antes do envio? | Product | Checkpoint 2 | **Resolvido**: fora de escopo neste intent |
| Pacotes exatos (`speech_to_text` / `flutter_tts`) vs alternativas | Eng | Construction | **Resolvido**: `speech_to_text` + `flutter_tts` (027/028) |
| `pause()` confiável no Android via `flutter_tts`? | Eng | Bolt 030 | Avaliar no plan; se instável, omitir UI de pause e manter stop |
| Valores exatos rate/volume/pitch para baixa alfabetização | Eng | Bolt 030 | Partir de rate ~0.45; calibrar volume/pitch no plan sem quebrar 028 |
