---
bolt: 032-rag-relevance-api
created: 2026-09-15T01:20:00Z
status: accepted
---

# ADR-016: Esclarecimento por template, sem LLM

## Context

FR-3 exige que, em empate ou mensagem vaga, a IA pergunte de novo em português
simples — sem chutar tópico e sem injetar RAG. O NFR do intent pede **0
chamadas LLM extra** só para perguntar o tópico, e 0 busca à knowledge base.

O gerador atual sempre chama Gemini depois do retrieve. Usar o mesmo caminho
para clarify geraria latência, custo e texto não determinístico (a pergunta
poderia listar os 6 tópicos ou vazar passos).

## Decision

O modo `clarify` **não chama o LLM**. A pergunta sai de
`ClarificationQuestionPolicy` (templates curtos):

- empate de 2 tópicos → “Você quer ajuda com {A} ou com {B}?”
- vago / low → “O que você está tentando fazer agora?”

Zero retrieve de steps. Zero Gemini. Vocabulário alinhado ao ux-guide.

Gemini permanece só nos modos `rag` e `general`.

## Rationale

- NFR de esclarecimento é binário: template cumpre; LLM não garante 0 hop
- Testes de FR-3 assertam o texto/opções sem mock de modelo
- Evita o modelo “completar” com passos de Gov.br no meio da dúvida
- Público analfabeto digital precisa de frase curta e estável, não de variação

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| LLM curto com prompt “só pergunte” | Tom mais natural | Latência, custo, texto instável, pode listar 6 tópicos | Viola NFR e FR-3 |
| LLM + RAG vazio | Reusa o generator | Ainda chama Gemini; risco de inventar base oficial | Custo sem ganho |
| Tela nativa “escolha o tópico” | UI explícita | Fora do escopo (sem FR de tela) | Inception |

## Consequences

### Positive

- Clarify é o turno mais rápido do chat
- Contratos de teste determinísticos (≤ 2 opções; sem os 6)
- Sem regressão de p95 por pergunta extra

### Negative

- Tom menos “conversacional” que o Gemini
- Templates precisam cobrir empate vs vago; casos raros soam genéricos

### Risks

- **Usuário não entende a pergunta-template**: mitigado por frases do ux-guide
  e teto de 2 tentativas → modo `general` (ADR-018 no fluxo, story 005)
- **Empate com > 2 candidatos**: policy não lista todos; cai na pergunta aberta

## Related

- **Stories**: 004-low-confidence-clarification
- **Standards**: `ux-guide.md` (vocabulário simples); `tech-stack.md` (Gemini só geração)
- **Previous ADRs**: ADR-012 (LLM não classifica tópico), ADR-014 (tie não escolhe slug)
