---
unit: 001-rag-relevance-api
bolt: 032-rag-relevance-api
stage: model
status: complete
created: 2026-09-15T01:10:00Z
updated: 2026-09-15T01:10:00Z
---

# Static Model - RAG Relevance Orchestration (Bolt 032)

## Bounded Context

**Reply Orchestration & Topic Continuity** — decidir *como* responder depois
que o matching do bolt 031 já classificou a mensagem (`TopicMatch`). Este bolt
orquestra três modos de resposta, aplica troca imediata de tópico (com reset de
passo) e fecha o contrato de testes do intent.

Herdado do 031 (não redesenhar): `TopicMatch`, `QueryNormalizer`,
`TopicInferencePolicy`, `SafeKnowledgeAssembly`, ADR-012…015.

**Fronteiras**:
- **Dentro**: `ReplyMode`, limite de esclarecimentos, pergunta de esclarecimento,
  orientação geral, política de troca vs checkpoint, persistência de
  `topicSlug`/`currentStep`, contrato de regressão FR-8.
- **Fora**: matching lexical/fuzzy/aliases (031), Gemini como provedor (já existe),
  UI Flutter, novos tópicos no catálogo, embeddings.

**Paridade guest**: as mesmas regras valem para conversa autenticada e guest chat.
Não há modo paralelo.

**ADRs vinculantes (031)**:
- ADR-012 — inferência sem LLM
- ADR-014 — `high`/`tie`/`low`/`none`; empate não escolhe `displayOrder`
- ADR-015 — slug persistido é pista, não trava; tie/low não caem no tópico antigo

---

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **Conversation** (existente, regras novas) | `topicSlug?`, `currentStep`, mensagens | `topicSlug` só é **gravado** quando o turno resolve `high` (único). Em `clarify`, não se persiste slug chutado. Em modo `general` por assunto fora do catálogo, `topicSlug` fica `null`. Troca `high` para outro slug zera `currentStep`. Checkpoints não alteram `topicSlug`. Guest e autenticado compartilham as mesmas invariantes. |
| **Message** (existente) | `role`, `content`, metadata opcional | Histórico recente é a fonte da **ClarificationStreak**. Mensagem assistant em modo `clarify` conta como tentativa de esclarecimento. |
| **AssistantReplyPlan** (resultado de domínio, não persistido) | `mode`, `contentSource`, `persist`, `knowledge` | Único plano por turno. O gerador **não** mistura RAG com clarify/general. |

Não há agregado persistido novo. O contrato de testes (story 007) é uma
**especificação de domínio**, não entidade de runtime.

---

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **ReplyMode** | `rag` \| `clarify` \| `general` | Exatamente um por turno. `rag` é o único modo que pode carregar `steps` da KB. |
| **ClarificationStreak** | `count` (0–2) | Conta esclarecimentos **seguidos** sem match `high`. Máximo de 2 perguntas; a 3ª mensagem ainda vaga/empatada/baixa cai em `general`. Qualquer `high` ou checkpoint de tutorial zera a streak. |
| **MessageSubstance** | `vacuous` \| `checkpoint` \| `catalog` \| `outOfCatalog` | `vacuous`: pedido de ajuda sem assunto (`me ajuda`, `não funciona`, `e agora`). `checkpoint`: `sim`/`não`/`ok`/`consegui`/`não consegui` (e equivalentes já cobertos por `CheckpointResponsePolicy`). `catalog`: `TopicMatch.high` (ou sinal de catálogo). `outOfCatalog`: pergunta com substância que não casa os 6 tópicos (ex.: Instagram, inclusive `instagran`). |
| **PersistDecision** | `set(slug)` \| `clear` \| `leaveUnchanged` | `set` só com `high`. `clear` em troca para fora do catálogo / modo geral com assunto novo. `leaveUnchanged` em clarify (não gravar chute) e em checkpoint (não trocar). |
| **StepDecision** | `resetToZero` \| `advance` \| `repeat` \| `keep` \| `irrelevant` | `resetToZero` só na **troca** para outro tópico `high`. Checkpoint positivo → `advance`; negativo → `repeat`. Mesmo tópico com erro de escrita (`uifi` no Wi-Fi) → `keep` (não zera). Modo `general` → `irrelevant`. |
| **TopicSwitch** | `occurred: boolean`, `fromSlug?`, `toSlug?` | `occurred` somente se o turno resolve um slug **diferente** do persistido (incluindo persistido → `null` fora do catálogo). Checkpoints **nunca** produzem switch. Continuação do mesmo tópico com grafia errada **não** é switch. Primeira mensagem da conversa não é switch — é inferência inicial. |
| **ClarificationQuestion** | `text`, `options[]` | Frases curtas, vocabulário simples (ux-guide). Se empate de exatamente 2 tópicos, `options` tem **no máximo 2** títulos concretos. Não é obrigação listar os 6 tópicos. Sem RAG. Template de domínio — **0 chamadas à KB**. |
| **GeneralOrientationBrief** | `isOfficialCatalog: false`, `mayOfferAppTopics: boolean` | Prompt deixa explícito “orientação geral”, não “base oficial”. Guardrails de senha/token **iguais** ao RAG. Ao final, **no máximo uma** frase oferecendo os assuntos do app, sem mudar o tema da resposta. |
| **ReplyPlan** | `mode`, `persist`, `step`, `switch`, `knowledge`, `question?`, `general?` | `knowledge.steps` vazio se `mode !== rag`. `question` só se `clarify`. `topicSlug` no contexto injetável só se `rag`. |

### TopicMatch (herdado, uso neste bolt)

`slug` preenchido **somente** se `high`. Em `tie`/`low`/`none` o orquestrador
nunca promove um candidato a slug persistido.

---

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| **Conversation** | Messages, `topicSlug?`, `currentStep` | (1) Não persistir slug chutado (`tie`/`low`). (2) Troca `high` diferente → `topicSlug` novo e `currentStep = 0`. (3) Checkpoint não muda `topicSlug` nem dispara `TopicSwitch`. (4) Fora do catálogo com substância → `topicSlug` null. (5) `currentStep` só avança/repete dentro do **mesmo** tópico via checkpoint. |
| **ReplyPlan** (resultado) | mode, persist, step, knowledge | Um modo. Zero steps se não for `rag`. Guest e autenticado produzem o mesmo tipo de plano para o mesmo input. |

**KnowledgeTopic** permanece no bounded context do 031. Este bolt **consome**
`KnowledgeContext` seguro; não altera aliases, keywords nem steps.

---

## Máquina de decisão (normativa)

Ordem importa. Avaliar de cima para baixo **uma vez por turno**.

```text
match      = TopicMatch da mensagem atual (031)
persisted  = Conversation.topicSlug
streak     = ClarificationStreak
substance  = MessageSubstance
isCheckpoint = CheckpointResponsePolicy.matches (sim/não/ok/consegui/…)

1. isCheckpoint && persisted
     → mode = rag
     → persist = leaveUnchanged
     → step = advance | repeat (policy existente)
     → switch.occurred = false
     → streak = 0
     → knowledge = tópico persistido (continuidade ADR-015)

2. match.high && slug != persisted
     → mode = rag
     → persist = set(novo slug)
     → step = resetToZero
     → switch.occurred = true
     → streak = 0
     → knowledge = só o tópico novo (StaleTopicIgnored já no 031)

3. match.high && (slug == persisted || persisted vazio)
     → mode = rag
     → persist = set(slug)
     → step = keep se mesmo slug; resetToZero se era vazio (início)
     → switch.occurred = false
     → streak = 0

4. streak.count >= 2 && match não é high
     → mode = general          // 3ª mensagem ainda vaga/empatada
     → persist = clear se não houver checkpoint; senão leaveUnchanged
     → step = irrelevant
     → knowledge.steps = []

5. match.tie || match.low
     → mode = clarify
     → persist = leaveUnchanged   // não gravar chute; não usar persistido no prompt
     → step = keep (índice irrelevante neste turno; prompt sem steps)
     → knowledge.steps = []
     → ClarificationQuestion: máx. 2 opções se empate de 2; senão pergunta aberta
     → streak = streak + 1

6. match.none && substance.outOfCatalog
     → mode = general
     → persist = clear
     → step = irrelevant
     → switch.occurred = true se havia persisted
     → knowledge.steps = []
     → GeneralOrientationBrief (guardrails ligados)

7. match.none && substance.vacuous && !persisted
     → mode = clarify (pergunta o que a pessoa está tentando fazer)
     → persist = leaveUnchanged
     → knowledge.steps = []
     → streak = streak + 1
     → se isso faria streak > 2, aplicar regra 4 em vez desta

8. match.none && persisted && !isCheckpoint
     → continuidade fraca: NÃO chutar outro tópico
     → se substance.outOfCatalog → regra 6
     → senão (vacuous no meio do tutorial) → mode = rag do persistido
         persist = leaveUnchanged, step = keep, switch = false
```

**Proibido**:
- Injetar steps em `clarify` ou `general`
- Gravar `topicSlug` a partir de `tie`/`low`
- Trocar tópico em checkpoint
- Zerar `currentStep` quando o match `high` é o **mesmo** tópico (ex.: `uifi` no Wi-Fi)
- Terceira pergunta de esclarecimento seguida

---

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| **ReplyModeResolved** | Plano fechado para o turno | `mode`, `conversationId`, `match.confidence` |
| **ClarificationRequested** | `mode = clarify` | `streak`, `optionSlugs[]` (0–2) |
| **ClarificationLimitReached** | 3ª mensagem ainda sem `high` | `conversationId` |
| **GeneralOrientationUsed** | `mode = general` | `reason`: `out_of_catalog` \| `clarify_exhausted` |
| **TopicSwitched** | `TopicSwitch.occurred` | `fromSlug?`, `toSlug?`, `currentStepReset: true` |
| **TopicSwitchSuppressed** | Checkpoint com persisted slug | `slug`, `checkpointDecision` |
| **SlugNotPersisted** | Clarify recusou gravar candidatos | `candidateSlugs[]` |

Eventos conceituais (log/telemetria). Sem event bus neste bolt.

---

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|-------------|
| **ReplyModeResolver** | `resolve(match, conversation, substance, streak): ReplyPlan` | Aplica a máquina normativa. Único ponto que escolhe o modo. |
| **MessageSubstanceClassifier** | `classify(message, match, checkpointPolicy): MessageSubstance` | Checkpoints da policy existente; `vacuous` por léxico curto de ajuda; `outOfCatalog` = `none` com substância. **Sem LLM.** |
| **ClarificationStreakCounter** | `count(recentMessages): ClarificationStreak` | Heurística no histórico recente (assistant em clarify sem `high` depois). Campo persistido só se a heurística for insuficiente na Stage 2. |
| **ClarificationQuestionPolicy** | `compose(match): ClarificationQuestion` | Empate de 2 → até 2 opções concretas. Vago → pergunta aberta (“o que você está tentando fazer?”). Sem buscar KB. |
| **TopicSwitchPolicy** | `decide(match, persisted, isCheckpoint): TopicSwitch + StepDecision` | Formaliza FR-5 + ADR-015. Checkpoint suprime switch. `high` diferente → reset 0. Mesmo slug → keep. |
| **GeneralOrientationPolicy** | `brief(): GeneralOrientationBrief` | Marca orientação geral; oferece 1 frase de assuntos do app; **não** lista steps. |
| **CheckpointContinuationPolicy** | `isContinuation(message): boolean` | Delega a `CheckpointResponsePolicy` (005). Continuação **não** é clarify e **não** é troca. |
| **GuestParityPolicy** | `assertSamePlan(authenticatedPlan, guestPlan)` | Mesma mensagem + mesmo estado → mesmo `ReplyPlan` (modo, persist, steps). |
| **RelevanceRegressionSpec** | corpus FR-2, pares negativos, cenários 004–006 | Especificação executável na Stage 5; sem Gemini real. |

Serviços do 031 (`TopicInferencePolicy`, `SafeKnowledgeAssembly`) são
**pré-condição**. O resolver só roda depois do match.

---

## Repository / Ports

| Port | Entity | Methods |
|------|--------|---------|
| **ConversationRepository** (existente) | Conversation | `save` deve honrar `PersistDecision` e `StepDecision` no mesmo UoW do turno (user + assistant + slug + step). Guest: equivalente no fluxo `reply-guest-message`. |
| **MessageRepository** (existente) | Message | `listRecent(conversationId)` para streak. Metadata pode registrar `replyMode` para a heurística (decisão de Stage 2). |
| **KnowledgeRetriever** (031) | KnowledgeContext | Já devolve steps só em `high`. Orquestrador **não chama** retrieve em `clarify`/`general` (NFR: 0 busca KB no esclarecimento). |
| **AssistantReplyGenerator** (existente, contrato evoluído) | AssistantReply | Input passa a incluir `ReplyPlan`. Três montagens de prompt: RAG / clarify (template) / general (appendix). Output ainda passa em `SensitiveContentPolicy`. Devolve `resolvedTopicSlug` coerente com `PersistDecision`. |
| **LlmProvider** (existente) | — | Usado em `rag` e `general`. Clarify **pode** ser template puro (preferido pelo NFR). Sem inferir tópico. |

Não há endpoint HTTP novo. O contrato REST de chat permanece; muda a orquestração
interna. Guest e autenticado compartilham o resolver.

---

## Prompt (contratos de conteúdo)

### Modo `rag`

- System prompt com passos **somente** do tópico `high` (já garantido pelo 031).
- Após troca, passos do tópico antigo **ausentes**.
- Checkpoints do tutorial seguem o fluxo 005.

### Modo `clarify`

- **Nenhum** passo dos 6 tópicos.
- Pergunta curta; máx. 2 opções se empate binário.
- Não afirma base oficial.
- Não grava slug.

### Modo `general`

- Nenhum passo dos 6 tópicos.
- Texto explícito de orientação geral (não “base oficial”).
- Guardrails de senha/token/OTP idênticos.
- Uma frase opcional oferecendo assuntos do app, sem desviar o tema.
- Não persiste slug de catálogo.

---

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **Modo RAG** | Resposta guiada com passos curados de **um** tópico `high` |
| **Esclarecer (`clarify`)** | Perguntar de novo, sem chutar tópico e sem injetar KB |
| **Orientação geral (`general`)** | Ajuda do LLM fora do catálogo (ou após 2 clarifys), sem passos oficiais |
| **Streak de esclarecimento** | Quantas vezes seguidas a IA perguntou sem fechar um `high` (teto 2) |
| **Troca imediata** | Novo `high` diferente do persistido: grava slug novo e zera o passo **no mesmo turno** |
| **Checkpoint** | `sim`/`não`/`ok`/`consegui`/`não consegui` — continuação, nunca troca |
| **Não persistir slug** | Não gravar candidato incerto; não promove `tie`/`low` a tópico da conversa |
| **Fora do catálogo** | Assunto com substância que não é um dos 6 tópicos (ex.: Instagram) |
| **Vago** | Pedido de ajuda sem assunto nomeado (`me ajuda`, `não funciona`) |
| **Paridade guest** | Mesmas regras de modo, persistência e troca no chat sem login |
| **Contrato FR-8** | Suite que trava Wi-Fi≠Gov.br, clarify, general, troca e corpus sem LLM real |

---

## Stories Coverage

| Story | Cobertura no modelo |
|-------|---------------------|
| **004-low-confidence-clarification** | `ReplyMode.clarify`, `ClarificationStreak` (teto 2), `ClarificationQuestionPolicy`, `PersistDecision.leaveUnchanged`, regra 4 → general, steps vazios |
| **005-out-of-catalog-general-knowledge** | `MessageSubstance.outOfCatalog`, `GeneralOrientationPolicy`, `persist.clear`, guardrails reusados, 1 frase de oferta do app |
| **006-immediate-topic-switch** | `TopicSwitchPolicy`, `StepDecision.resetToZero`, checkpoint suprime switch, mesmo tópico + typo → `keep`, guest parity, troca para fora do catálogo → `clear` |
| **007-relevance-regression-tests** | `RelevanceRegressionSpec`: corpus FR-2, pares negativos, empate→clarify, Instagram→general, Gov.br→Wi-Fi com step 0, LLM mockado |

---

## Relação com o bolt 031

| 031 entrega | 032 consome |
|-------------|-------------|
| `TopicMatch` com slug só em `high` | Resolver nunca promove `tie`/`low` |
| Retriever não gruda slug contra `high` novo | Persistência e `currentStep` acompanham a troca |
| Steps vazios se não `high` | Clarify/general nem chamam retrieve |
| ADR-015: `none` + persistido = continuidade | Formalizado: só se checkpoint ou vago no tutorial; `outOfCatalog` limpa o slug |

---

## Fora deste bolt

- Recalibrar aliases/pesos (031)
- Embeddings / pgvector
- Tela de “você mudou de assunto”
- CMS de aliases
- Teste E2E Flutter
