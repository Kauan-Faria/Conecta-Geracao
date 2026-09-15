---
bolt: 031-rag-relevance-api
created: 2026-09-15T00:43:00Z
status: accepted
---

# ADR-014: Confiança high/tie/low/none e empate sem displayOrder

## Context

O matcher antigo somava +1 por keyword e, em empate, ficava com o **primeiro**
tópico de `displayOrder`. Gov.br (ordem 2) vencia Wi-Fi (ordem 4) em “código QR”
por causa da keyword genérica `codigo`.

Precisamos de um contrato explícito: quando injetar RAG, quando recusar steps,
quando o bolt 032 deve perguntar.

## Decision

A inferência devolve `TopicMatch` com `MatchConfidence`:

| Confiança | Quando | `slug` | Steps RAG |
|-----------|--------|--------|-----------|
| `high` | `best >= 2` e `(best - second) >= 2` | vencedor | sim |
| `tie` | `best >= 2` e diferença `< 2` | vazio | não |
| `low` | `0 < best < 2` (só genérico/ruído) | vazio | não |
| `none` | `best == 0` | vazio | não |

**Empate nunca usa `displayOrder`.**

Pesos: slug +5, alias +4, keyword específica +2, keyword **genérica** +0.5.

Genéricas (constante de domínio, mesmo se ainda existirem no seed):
`codigo`, `cadastro`, `rede`, `internet`, `pagamento`, `conta`, `app`, `site`.

Fuzzy (Levenshtein) só se o termo tiver comprimento ≥ 4 (1 edição em 4 chars;
até 2 se ≥ 5). `pix`, `qr`, `zap` só por exato/alias.

Limiares e pesos podem ser ajustados em Construction se um caso do corpus
falhar; a **semântica** das quatro confianças não muda.

## Rationale

- Torna o bug Wi-Fi→Gov.br impossível por desempate de lista
- `low`/`tie` alimentam o bolt 032 (perguntar de novo) sem chutar
- Pesos separados impedem genérico de atingir o piso 2 sozinho (0.5 < 2)

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Primeiro da lista no empate | Simples | Causa o bug atual | Proibido |
| Sempre o maior score, mesmo diferença 0.5 | Menos `tie` | Chute entre QR vs gov | Produto: perguntar na dúvida |
| Classificador LLM da confiança | Flexível | Não determinístico | ADR-012 |
| Pesos iguais alias = keyword | Mais simples | Alias de erro de escrita perderia para genérico | Público-alvo escreve errado |

## Consequences

### Positive

- Tabela de casos de teste mapeia 1:1 para confiança
- Bolt 032 tem sinal claro (`tie`/`low`/`none`) sem reimplementar score
- Genérico sozinho nunca injeta RAG

### Negative

- Limiares são mágicos (2 e 2); precisam de comentário + testes
- Alias forte (`qr` no Wi-Fi) pode ganhar de Gov.br em “código QR” — desejável se `qr` for alias só de Wi-Fi; “código” sozinho continua `low`

### Risks

- **Calibração**: se testes de corpus falharem, ajustar peso/limiar no mesmo ADR (amend na Construction), não voltar ao displayOrder
- **Keyword `qr` com 2 letras**: não entra em fuzzy; precisa ser alias explícito do Wi-Fi

## Related

- **Stories**: 001-normalize-and-fuzzy-match, 002-topic-alias-corpus, 003-never-inject-wrong-topic
- **Standards**: nenhuma
- **Previous ADRs**: ADR-012 (lexical), ADR-013 (aliases)
