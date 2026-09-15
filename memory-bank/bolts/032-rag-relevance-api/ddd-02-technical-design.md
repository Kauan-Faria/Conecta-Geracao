---
unit: 001-rag-relevance-api
bolt: 032-rag-relevance-api
stage: design
status: complete
created: 2026-09-15T01:15:00Z
updated: 2026-09-15T01:15:00Z
---

# Technical Design - RAG Relevance Orchestration (Bolt 032)

## Architecture Pattern

**Hexagonal, mesmo módulo `conversations`.** Sem módulo novo, sem endpoint novo,
sem embeddings, sem coluna SQL nova.

A máquina de modos (`ReplyModeResolver`) vive no **domínio puro** (sem I/O, sem
LLM). O adapter `GeminiAssistantReplyGenerator` orquestra: match (031) → plano
(032) → prompt → persistência. Guest e autenticado passam pelo **mesmo**
generator.

Decisões de desenho (não mudam o HTTP):

1. **Inferir antes de retrieve.** `TopicMatch` vem da policy 031. `retrieve` só
   roda se o plano for `rag` (NFR: esclarecimento não busca KB de steps).
2. **Clarify é template.** Zero LLM, zero steps. Cumpre NFR de 0 chamada extra
   só para perguntar o tópico.
3. **Streak no metadata da mensagem assistant** (`replyMode`), não em coluna de
   `Conversation`. Heurística barata e testável.
4. **`resolvedTopicSlug` é o valor pós-turno** (não um delta). O use case grava
   o que o generator devolver, inclusive `null`.

---

## Layer Structure

```text
┌─────────────────────────────────────────────────────────────┐
│ Presentation (inalterada)                                   │
│  POST /api/v1/conversations/:id/messages                    │
│  POST guest chat (já existente)                             │
│  Envelope { data, meta } — texto do assistente igual        │
├─────────────────────────────────────────────────────────────┤
│ Application                                                 │
│  SendMessageUseCase / ReplyGuestMessageUseCase              │
│  persistem: messages + topicSlug=resolvedTopicSlug          │
│             + currentStep=nextCurrentStep                   │
│  metadata.replyMode na mensagem assistant                   │
├─────────────────────────────────────────────────────────────┤
│ Domain                                                      │
│  TopicInferencePolicy          (031, pré-condição)          │
│  CheckpointResponsePolicy      (005)                        │
│  SensitiveContentPolicy        (005)                        │
│  MessageSubstanceClassifier    (NOVO)                       │
│  ClarificationStreakCounter    (NOVO)                       │
│  TopicSwitchPolicy             (NOVO)                       │
│  ClarificationQuestionPolicy   (NOVO)                       │
│  GeneralOrientationPolicy      (NOVO)                       │
│  ReplyModeResolver             (NOVO) → ReplyPlan           │
├─────────────────────────────────────────────────────────────┤
│ Infrastructure                                              │
│  GeminiAssistantReplyGenerator — fluxo abaixo               │
│  RagPromptBuilder — appendices rag | general                │
│  PrismaKnowledgeRetriever — só se mode === rag              │
│  Gemini LlmProvider — rag e general; NÃO clarify            │
└─────────────────────────────────────────────────────────────┘
```

### Arquivos (evoluir, não duplicar)

```text
conversations/domain/
  value-objects/
    reply-mode.vo.ts                 # rag | clarify | general
    reply-plan.vo.ts                 # mode + persist slug + step + switch
    message-substance.vo.ts          # vacuous | checkpoint | catalog | outOfCatalog
    clarification-streak.vo.ts       # count 0–2
  services/
    message-substance.classifier.ts  # NOVO (léxico, sem LLM)
    clarification-streak.counter.ts  # NOVO
    clarification-question.policy.ts # NOVO (templates PT simples)
    topic-switch.policy.ts           # NOVO
    general-orientation.policy.ts    # NOVO
    reply-mode.resolver.ts           # NOVO

conversations/infrastructure/assistant/
  rag-prompt.builder.ts              # EVOLUIR: buildRag / buildGeneral
  gemini-assistant-reply.generator.ts # EVOLUIR: ramos por ReplyPlan
  stub-assistant-reply.generator.ts  # EVOLUIR: mesmos ramos (testes / sem Gemini)

conversations/application/use-cases/
  send-message.use-case.ts           # EVOLUIR: gravar slug null + metadata
  reply-guest-message.use-case.ts    # EVOLUIR: paridade

conversations/domain/testing/        # ou __fixtures__
  relevance-corpus.ts                # NOVO — contrato FR-8
```

Não criar `conversations` paralelo nem `RagRelevanceModule`.

---

## Fluxo do turno (normativo)

Substitui o pipeline 005 no generator. Use cases só carregam estado, chamam
`generateReply` e persistem o retorno.

```text
1. Load conversation + últimas N mensagens (já feito)
2. generateReply({ userMessage, topicSlug: persisted, currentStep, history })

   a. SensitiveContentPolicy no input → recusa (inalterado); fim
   b. isCheckpoint = CheckpointResponsePolicy
   c. match = TopicInferencePolicy.infer(userMessage, topics, persisted)
        — carregar sinais dos 6 tópicos (slug, title, aliases, keywords)
        — NÃO carregar steps ainda
   d. substance = MessageSubstanceClassifier.classify(message, match, isCheckpoint)
   e. streak = ClarificationStreakCounter.count(history)
        — conta assistants seguidos com metadata.replyMode === 'clarify'
        — zera se o último assistant foi rag/general
   f. plan = ReplyModeResolver.resolve({ match, persisted, currentStep,
                                         substance, streak, isCheckpoint })
   g. switch (plan.mode)
        rag:
          context = KnowledgeRetriever.retrieve({ topicSlug: match.slug | persisted,
                                                  userMessage })
          se plan.switch → currentStep efetivo = 0 no prompt
          prompts = RagPromptBuilder.buildRag(context, step, history)
          text = LlmProvider.generate(prompts)
        clarify:
          question = ClarificationQuestionPolicy.compose(match)
          text = question.text          // template; SEM retrieve; SEM LLM
        general:
          brief = GeneralOrientationPolicy.brief()
          prompts = RagPromptBuilder.buildGeneral(userMessage, history, brief)
          text = LlmProvider.generate(prompts)
          // steps obrigatoriamente []
   h. SensitiveContentPolicy no output (rag e general; clarify já é template)
   i. return AssistantReply {
        content,
        replyMode: plan.mode,
        resolvedTopicSlug: slugPósTurno(plan, persisted),
        nextCurrentStep: stepPósTurno(plan, currentStep, checkpointDecision),
      }

3. UoW: insert user + assistant (metadata.replyMode) +
        conversation.topicSlug = resolvedTopicSlug +
        conversation.currentStep = nextCurrentStep
```

### Refinamento vs domínio: checkpoint durante clarify

Regra 1 do modelo (`isCheckpoint && persisted` → RAG do tutorial) **só vale se
`streak.count === 0`**. Se o último assistant foi `clarify`, `sim`/`não` são
resposta ao esclarecimento, não avanço de passo. Tratar como `vacuous` (permanece
clarify, ou general se estourar o teto).

### `slugPósTurno`

| PersistDecision | resolvedTopicSlug |
|-----------------|-------------------|
| `set(slug)` | `slug` |
| `clear` | `null` |
| `leaveUnchanged` | `persisted` (pode ser `null`) |

Use cases **sempre** escrevem `resolvedTopicSlug` — não há “se high então grava”.

### `stepPósTurno`

| StepDecision | nextCurrentStep |
|--------------|-----------------|
| `resetToZero` | `0` |
| `keep` | `currentStep` |
| `advance` | policy 005 (checkpoint positivo) |
| `repeat` | `currentStep` |
| `irrelevant` | `0` (slate limpo junto com `clear`) |

No prompt RAG após troca, o índice usado **é 0**, mesmo que a persistência
corra depois no UoW.

---

## Contratos internos (TypeScript conceitual)

```text
ReplyMode = 'rag' | 'clarify' | 'general'

ReplyPlan {
  mode: ReplyMode
  persist: 'set' | 'clear' | 'leaveUnchanged'
  slugToSet?: string          // só se persist === 'set'
  step: 'resetToZero' | 'advance' | 'repeat' | 'keep' | 'irrelevant'
  switchOccurred: boolean
}

AssistantReply {
  content: string
  nextCurrentStep: number
  resolvedTopicSlug: string | null
  replyMode: ReplyMode
}

GenerateReplyInput {
  userMessage: string
  topicSlug?: string | null
  currentStep: number
  messageHistory: Array<{ role, content, metadata? }>
}
```

Port `AssistantReplyGenerator.generateReply` passa a devolver `replyMode`.
Campos novos são **aditivos**; stub e Gemini implementam os dois.

---

## API Design

**Nenhum endpoint novo.** Prefixo `/api/v1/` e envelope `{ data, meta }`
inalterados (`api-conventions.md`).

| Endpoint | Mudança observável |
|----------|-------------------|
| `POST /api/v1/conversations/:id/messages` | Texto: pergunta curta (clarify), orientação geral, ou RAG do tópico certo. `topicSlug`/`currentStep` no recurso conversa seguem o plano. |
| Guest chat (já existente) | **Paridade**: mesmo generator, mesmas regras. |

Opcional aditivo: `metadata.replyMode` na mensagem assistant (Flutter ignora;
útil para streak e debug). Sem breaking change. `map_action` (ADR-004) não é
emitido em clarify/general.

Não expor `POST /topics/infer` (já rejeitado no ADR-015).

---

## Data Persistence

| Tabela / campo | Mudança neste bolt |
|----------------|--------------------|
| `Conversation.topicSlug` | Sem migration. Runtime: gravar slug em `high`; `null` em general/out-of-catalog; inalterado em clarify. |
| `Conversation.currentStep` | Sem migration. Runtime: `0` na troca e no `clear`. |
| `Message.metadata` | JSON já existe. Assistant: `{ replyMode: 'rag'\|'clarify'\|'general' }`. Sem coluna nova. |
| `KnowledgeTopic.aliases` | Inalterado (031). |

**Por que não `consecutive_clarify_count`:** o histórico recente + `replyMode`
já fecha FR-3. Evita migration e divergência guest/auth. Se a heurística falhar
em produção, aí sim coluna — fora deste bolt.

UoW único por turno (já existe): user message + assistant message + conversation
update. Guest UoW equivalente.

---

## Prompt Design

### `buildRag` (existente, ajuste)

- Steps só do contexto 031 (`high`).
- Após `switchOccurred`, passo 0 — **não** incluir steps do slug antigo
  (031 já não os injeta; o builder não deve reutilizar cache de contexto).
- Checkpoints do tutorial 005 só neste modo.

### `buildClarify` — não é prompt LLM

Templates (vocabulário simples, ux-guide):

| Caso | Template |
|------|----------|
| Empate de 2 candidatos | `Você quer ajuda com {títuloA} ou com {títuloB}?` |
| `low` / vago sem tópico | `O que você está tentando fazer agora?` |
| `low` com 1 candidato fraco | `É sobre {título}? Se não for, me conta o que você precisa.` |

**Não** listar os 6 tópicos como obrigação. **Não** mencionar “base oficial”.
Máximo 2 opções concretas.

### `buildGeneral`

System appendix obrigatório:

- Está em **orientação geral**, não na base oficial do app.
- Não copiar nem inventar passos dos 6 tutoriais.
- Linguagem simples; uma instrução principal.
- Guardrails: nunca pedir senha, PIN, OTP, token, dado bancário.
- **No máximo uma** frase final oferecendo os assuntos do app, sem mudar o tema.

User prompt = mensagem atual + histórico curto. `KnowledgeContext.steps = []`.
Assert de teste: system+user **não** contêm instruções curadas de Wi-Fi/Gov.br/PIX.

---

## MessageSubstanceClassifier

Sem LLM. Ordem:

1. Se `match.high` → `catalog`
2. Se `isCheckpoint` e `streak === 0` → `checkpoint`
3. Se a mensagem normalizada só tem tokens do léxico vago → `vacuous`
4. Senão, se `match.none` ou `low`/`tie` com substância nomeada fora do catálogo
   → `outOfCatalog` quando `none`; `tie`/`low` ficam para o resolver (clarify)

**Léxico vago (constante de domínio):** `me ajuda`, `ajuda`, `nao funciona`,
`nao sei`, `e agora`, `oi`, `ola`, `bom dia`, `por favor` — após o normalizer
031. Lista curta e testável; Construction pode acrescer sem API.

`instagran` / `instagram` → tokens com substância + `none` → `outOfCatalog` →
general (não forçar tópico).

---

## Security Design

| Concern | Approach |
|---------|----------|
| Auth | Inalterado (Firebase / guest + throttle já existentes) |
| Guardrails senha/token | `SensitiveContentPolicy` **antes** do resolver e **depois** de rag/general. Clarify é template controlado — ainda assim não interpolar a mensagem crua em log. |
| Prompt injection via KB | Clarify/general não recebem steps. General afirma não-oficial. |
| Vazamento de tópico errado | Retrieve só em `rag`; testes assertam ausência de passos alheios. |
| Logs | `mode`, `confidence`, `resolvedTopicSlug`, `switchOccurred`, `streak`. Sem PII; `sanitizeForLog` no conteúdo. |

---

## NFR Implementation

| Requirement | Design Approach |
|-------------|-----------------|
| Inferência < 50ms p95 | Mesmo caminho 031; resolver é O(1) sobre o match. |
| Esclarecimento: 0 busca RAG / 0 LLM extra | Template; skip retrieve e skip Gemini. |
| Chat p95 < 8s | General usa o mesmo Gemini; sem hop extra. Clarify é mais rápido (sem LLM). |
| Guardrails no modo geral | Mesma policy; appendix de prompt. |
| Paridade guest | Mesmo `AssistantReplyGenerator`. Teste: mesmo input → mesmo `ReplyPlan`. |
| Sem regressão de map_action | Só em `rag` quando a policy de maps já aplicaria; clarify/general não emitem. |

---

## Error Handling

| Caso | Comportamento |
|------|----------------|
| LLM falha em `rag`/`general` | Mensagem amigável já existente; **não** persistir slug chutado; steps não vazam. |
| Tópico `high` some do repo | Tratar como `none` + general ou clarify (fail closed, 031); não fallback displayOrder. |
| History sem `replyMode` (mensagens antigas) | Streak = 0 (não clarificar em loop por engano). |
| Guest sem conversa persistida longa | Streak 0; primeira mensagem segue regras 2–7. |
| Exceção no resolver | Fail closed: `general` sem steps, slug `leaveUnchanged` (não inventar tópico). Preferível a chutar RAG. |

---

## External Dependencies

| Service | Purpose | Integration |
|---------|---------|-------------|
| Gemini | Modos `rag` e `general` | Port `LlmProvider` já existente |
| Postgres / Prisma | Conversas, mensagens, tópicos | Sem migration neste bolt |
| Knowledge-base seed | Títulos para opções de clarify | `findAllActive` (aliases já no 031) |

---

## Testes (contrato FR-8 — story 007)

Fixture compartilhada `relevance-corpus.ts`: grafias FR-2 + pares negativos +
cenários de orquestração. **Nenhum teste chama Gemini real.**

| Suite | Casos obrigatórios |
|-------|--------------------|
| `reply-mode.resolver.spec` | tie → clarify; 3ª vaga → general; Instagram → general; Gov.br+wifi → rag+switch+step 0; `sim` com persisted → rag sem switch; `sim` após clarify → **não** avança tutorial |
| `message-substance.classifier.spec` | `me ajuda` vacuous; `instagran` outOfCatalog; `ok` checkpoint |
| `clarification-streak.counter.spec` | 0/1/2; zera após rag |
| `clarification-question.policy.spec` | empate Wi-Fi vs Gov.br → ≤ 2 opções; vago não lista 6 |
| `topic-switch.policy.spec` | `uifi` no wifi → keep; troca → reset 0 |
| `rag-prompt.builder.spec` | general/clarify: zero texto de passos wifi/govbr/pix; general contém “orientação geral”; rag pós-troca só wifi |
| `gemini-assistant-reply.generator.spec` (LLM mock) | empate “código QR” → clarify, steps []; Instagram → general, steps []; sequência Gov.br → Wi-Fi → segundo contexto wifi e `nextCurrentStep` 0; `resolvedTopicSlug` null em general |
| `send-message` / `reply-guest-message` (unit, ports mock) | persistem o slug/step do reply; guest = auth para os mesmos casos |
| `topic-inference.policy.spec` (031) | corpus FR-2 100%; pares Wi-Fi≠Gov.br, PIX≠boleto, WhatsApp≠golpe |

CI: `*.spec.ts` no backend; 1 teste de integração de prompt com `LlmProvider`
mockado (não HTTP Gemini).

---

## Stories Mapping

| Story | Entregável |
|-------|------------|
| 004-low-confidence-clarification | Resolver + templates + streak metadata + skip retrieve/LLM |
| 005-out-of-catalog-general-knowledge | `buildGeneral` + persist `null` + guardrails |
| 006-immediate-topic-switch | `TopicSwitchPolicy` + step 0 + guest parity + checkpoint exception |
| 007-relevance-regression-tests | `relevance-corpus.ts` + suites acima |

---

## Integrações (use cases)

```text
SendMessageUseCase e ReplyGuestMessageUseCase:

  reply = generator.generateReply(...)
  conversation.topicSlug    = reply.resolvedTopicSlug
  conversation.currentStep  = reply.nextCurrentStep
  assistant.metadata.replyMode = reply.replyMode
```

Não ramificar guest vs auth no domínio. Se o stub generator existir para
ambiente sem chave, ele deve devolver o mesmo `ReplyPlan` (texto stub ok;
modo/slug/step reais).

---

## ADR (Stage 3)

Três escolhas deste desenho podem virar ADR se o time quiser registrar:

1. Clarify por **template** (não LLM)
2. Streak em **metadata** (não coluna)
3. **Skip retrieve** fora de `rag`

Nenhuma introduz tecnologia fora do tech-stack. Stage 3 deve oferecer, não forçar.
