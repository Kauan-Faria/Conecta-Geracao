---
bolt: 031-rag-relevance-api
created: 2026-09-15T00:43:00Z
status: accepted
---

# ADR-015: topicSlug persistido é pista, não trava o retrieve

## Context

`PrismaKnowledgeRetriever` hoje faz:

```text
slug = input.topicSlug  OU  infer(userMessage)
```

Se a conversa já tem `codigo-govbr`, **qualquer** mensagem seguinte (inclusive
“senha do wi-fi”) injeta passos de Gov.br. Isso “gruda” o tópico errado e viola
FR-1 / FR-6.

O bolt 032 cuida de resetar `currentStep` na troca. Este bolt precisa garantir
que o **contexto RAG** já siga a mensagem atual.

## Decision

`KnowledgeRetriever.retrieve({ topicSlug?, userMessage })` **sempre** infere a
partir de `userMessage`.

- `topicSlug` persistido é **pista de continuidade**: só reforça pontuação se a
  mensagem atual for compatível com aquele tópico (ou não tiver sinal de outro)
- Se `TopicMatch` for `high` em **outro** slug → contexto do novo tópico
  (`StaleTopicIgnored`)
- Se confiança não for `high` → `steps` vazio, `topicSlug` null no contexto
  injetável — **não** cair de volta no slug antigo

Não há endpoint novo. O HTTP de chat permanece; muda só o adapter interno.

## Rationale

- A mensagem atual é a fonte da verdade da intenção
- Checkpoints (`sim`/`não`) serão tratados no 032 como continuação; neste bolt,
  mensagem sem sinal tende a `none`/`low` e não injeta o tópico errado **novo**.
  Continuação com slug persistido: se a mensagem não contradiz, a pista pode
  manter o tópico (bônus de continuidade), o que preserva o fluxo de passos.

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Slug persistido sempre ganha | Estável no tutorial | Gruda tópico errado | Bug relatado |
| Ignorar slug persistido sempre | Simples | “sim” no meio do PIX poderia perder o tópico | 032 precisa de continuidade |
| Nova API `POST /topics/infer` | Explícito | Chat já tem contrato; extra hop | Sem valor |
| LLM decide se é troca de assunto | Flexível | Latência; não testável isolado | ADR-012 |

## Consequences

### Positive

- Sequência Gov.br → Wi-Fi injeta Wi-Fi já no 031
- Prompt builder nunca recebe steps do tópico antigo após match `high` novo
- Guest e autenticado compartilham o mesmo retriever

### Negative

- Bônus de continuidade precisa de regra clara para não regrudar genéricos
- Reset de `currentStep` **não** está neste bolt — se o generator ainda avançar
  o passo do tópico antigo até o 032, o contexto de steps já será o novo (passo
  0 efetivo no prompt via índice desencontrado). Construction deve zerar o
  índice usado no prompt quando o slug mudou, mesmo antes do 032 persistir.

### Risks

- **Meio-termo até o 032**: persistência do slug na conversa pode ficar defasada
  por um turno se `resolvedTopicSlug` não for atualizado. Mitigação: o generator
  já devolve `resolvedTopicSlug` — usar `match.slug` quando `high`.
- **Checkpoint “sim” classificado como none**: pista de continuidade mantém o
  tópico; 032 formaliza a exceção. Neste bolt, se `none` + persistedSlug, **não
  injetar outro tópico**; pode injetar o persistido só se não houver match
  contraditório (continuidade). Documentado: persistido vale na ausência de
  sinal, nunca contra um `high` diferente.

### Continuity rule (normative)

```text
match = infer(message)
if match.high && match.slug != persisted → usar match (troca)
if match.high && match.slug == persisted → usar match
if match in {tie, low} → steps vazios (não usar persistido para chutar)
if match.none && persisted → usar persistido (continuação / checkpoint)
if match.none && !persisted → steps vazios
```

## Related

- **Stories**: 003-never-inject-wrong-topic, 006-immediate-topic-switch (032)
- **Standards**: `api-conventions.md` (sem endpoint extra)
- **Previous ADRs**: ADR-012, ADR-014
