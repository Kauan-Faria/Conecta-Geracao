---
intent: 007-rag-relevance
phase: inception
status: complete
created: 2026-09-15T00:24:00.000Z
updated: 2026-09-15T00:39:00.000Z
---

# Requirements: Relevância do RAG e tolerância a erros de escrita

## Intent Overview

Garantir que **qualquer resposta da IA seja condizente com a pergunta**. Se o
usuário pergunta sobre Wi-Fi, a resposta é sobre Wi-Fi — nunca Gov.br, PIX ou
outro assunto.

O público é de **analfabetos digitais** (20–70+): escrevem muitas palavras
errado, sobretudo as complexas (`wi-fi`, `whatsapp`, `gov.br`). O assistente
precisa reconhecer a intenção mesmo com erros, hífen, espaço e grafias
fonéticas.

Quando a intenção não estiver clara, a IA **pergunta de novo** em linguagem
simples para entender — não chute um tópico. Perguntas **fora dos 6 tópicos
curados** podem ser respondidas com o **conhecimento geral da IA**, ainda com
vocabulário simples e guardrails (sem pedir senha/token). Se a pessoa mudar de
assunto no meio da conversa, o tópico **troca na hora**.

Este intent corrige o retrieval atual (keyword exata + tópico “grudado”), sem
adicionar novos tópicos ao catálogo do MVP.

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Resposta no mesmo assunto da pergunta | 0 casos de teste em que o contexto RAG de outro tópico é injetado (ex.: Wi-Fi → Gov.br) | Must |
| Entender escrita com erros | Match correto no corpus de grafias comuns (hífen, falta/troca de letra, fonética) | Must |
| Não chutar tópico | Em baixa confiança/empate, a IA pergunta de novo até entender (máx. 2 tentativas) | Must |
| Ajudar além do catálogo | Pergunta fora dos 6 tópicos recebe orientação geral útil, sem passos de outro tópico curado | Must |
| Mudança de assunto imediata | Nova intenção clara troca `topicSlug` e reinicia o passo na mesma conversa | Must |

---

## Functional Requirements

### FR-1: Resposta sempre no assunto da pergunta
- **Description**: O orquestrador só injeta no prompt os passos da base de conhecimento do **tópico identificado**. Nunca mistura ou substitui por outro tópico.
- **Acceptance Criteria**:
  - Dada a pergunta sobre Wi-Fi (qualquer grafia do corpus), o contexto RAG é `wifi-qr-code` (ou equivalente) e **não** contém passos de `codigo-govbr`, PIX, boleto, WhatsApp ou golpe
  - Dada a pergunta sobre Gov.br, o contexto RAG é o tópico Gov.br — não Wi-Fi
  - O texto da resposta da IA trata do mesmo assunto da pergunta (avaliado por casos de teste com asserção de `topicSlug` + ausência de termos oficiais do tópico errado no contexto injetado)
  - Se nenhum tópico curado for identificado com confiança, **nenhum** passo de tópico curado é injetado no prompt
- **Priority**: Must

### FR-2: Inferência tolerante a erros de escrita
- **Description**: A identificação de tópico normaliza e compara a mensagem com slugs, keywords e **aliases** (incluindo erros comuns do público analfabeto digital).
- **Acceptance Criteria**:
  - Normalização mínima: minúsculas, remoção de acentos, tratamento de hífen/espaço (`wi-fi`, `wifi`, `wi fi` equivalem)
  - Matching **não** depende de substring exata da keyword (`wifi` deve casar com `wi-fi`)
  - Cada tópico MVP possui lista de aliases + erros comuns; a lista é expansível sem mudar a API pública
  - O corpus mínimo abaixo **deve** identificar o tópico correto (casos de teste obrigatórios)
  - Distância de edição / fonética simples cobre faltas e trocas de 1–2 letras em palavras-chave com comprimento ≥ 4
- **Priority**: Must

#### Corpus mínimo de grafias (expansível na Construction)

| Tópico | Grafias que devem acertar |
|--------|---------------------------|
| Wi-Fi | `wifi`, `wi-fi`, `wi fi`, `uifi`, `wify`, `wiffi`, `senha do wifi`, `qr do wifi`, `rede wifi` |
| Gov.br | `gov.br`, `govbr`, `gov br`, `goovi`, `governo`, `codigo do gov`, `gov brasi` |
| WhatsApp | `whatsapp`, `whatsap`, `watsap`, `uatsap`, `zap`, `whats`, `watzap` |
| PIX | `pix`, `pics`, `pixx`, `fazer um pix`, `pikis` |
| Boleto | `boleto`, `boletu`, `boletoo`, `segunda via`, `2 via`, `conta atrasada` |
| Golpe | `golpe`, `golpi`, `fraude`, `mensagem estranha`, `link suspeito` |

A Construction pode acrescentar mais aliases desde que os testes do corpus mínimo continuem passando.

### FR-3: Baixa confiança — perguntar de novo para entender
- **Description**: Se a mensagem não permitir identificar **um** tópico com confiança (empate, score baixo, mensagem vaga), a IA **não escolhe** um tópico. Pergunta de novo, em linguagem simples, para entender o que a pessoa precisa.
- **Acceptance Criteria**:
  - Empate entre dois tópicos (ex.: “código QR” sem “wifi” nem “gov”) → pergunta esclarecedora, **sem** injetar passos de nenhum dos dois
  - Mensagem vaga (“não funciona”, “me ajuda”, “e agora”) sem tópico na conversa → pergunta o que a pessoa está tentando fazer
  - No máximo **2** perguntas de esclarecimento seguidas; se ainda não der para identificar um tópico curado, segue FR-4 (conhecimento geral)
  - A pergunta de esclarecimento usa frases curtas, sem jargão, e pode oferecer **no máximo 2** opções concretas quando o empate for entre dois tópicos
  - `topicSlug` da conversa **não** é gravado até haver um tópico único com confiança
- **Priority**: Must

### FR-4: Pergunta fora dos 6 tópicos — conhecimento geral da IA
- **Description**: Se a pergunta **não** corresponder a nenhum tópico curado (ex.: Instagram, Facebook, e-mail), a IA responde com conhecimento geral, em linguagem simples, **sem** puxar passos de outro tópico da base.
- **Acceptance Criteria**:
  - Nenhuma chunk/passo dos 6 tópicos entra no prompt nesses casos
  - A resposta é útil e condizente com a pergunta (não desvia para PIX/Gov.br/Wi-Fi só porque estão no catálogo)
  - Guardrails de `001-digital-guidance` FR-5 continuam: nunca pedir senha, PIN, OTP, token ou dado bancário; orientar a usar o app/site oficial
  - Linguagem simples, uma instrução principal por mensagem
  - A resposta **não** afirma que o passo veio da “base oficial” do app
  - Após a orientação geral, pode oferecer, em uma frase, que também ajuda com os assuntos do app — sem forçar mudança de assunto
- **Priority**: Must

### FR-5: Troca imediata de tópico no meio da conversa
- **Description**: Se a conversa já tem um tópico e a pessoa pergunta outra coisa com confiança, o sistema **troca na hora**: novo `topicSlug`, passo reiniciado, contexto RAG do novo tópico.
- **Acceptance Criteria**:
  - Conversa em Gov.br + “como passo a senha do wi-fi” → tópico vira Wi-Fi, `currentStep` volta a 0, resposta usa só passos de Wi-Fi
  - Respostas curtas de checkpoint (`sim`, `não`, `ok`, `consegui`, `não consegui`) **não** trocam de tópico
  - Mensagem que continua o mesmo assunto com erro de escrita **não** é tratada como troca
  - Tópico anterior não permanece injetado no prompt após a troca
- **Priority**: Must

### FR-6: Matching não “gruda” em tópico errado
- **Description**: `topicSlug` já persistido só é reutilizado se a mensagem atual for continuação (checkpoint ou mesma intenção). Caso contrário, a inferência da mensagem atual prevalece.
- **Acceptance Criteria**:
  - Retriever **não** usa `topicSlug` antigo como único critério quando a mensagem nova tem outro tópico com confiança
  - Teste de regressão: sequência “gov.br” → “wifi” produz dois contextos distintos na ordem correta
  - Teste de regressão: “código QR do wi-fi” **não** escolhe Gov.br por causa da keyword `codigo`
- **Priority**: Must

### FR-7: Keywords genéricas não vencem o tópico certo
- **Description**: Termos amplos (`codigo`, `cadastro`, `rede`, `internet`, `pagamento`) não podem, sozinhos, selecionar um tópico se houver sinal mais específico na mensagem.
- **Acceptance Criteria**:
  - “código QR do wifi” → Wi-Fi, não Gov.br
  - “código do governo” → Gov.br
  - Empate só com termo genérico (só “código”) → FR-3 (perguntar de novo)
  - Keywords do seed são revisadas: aliases específicos sobem de peso; genéricos descem ou deixam de pontuar sozinhos
- **Priority**: Must

### FR-8: Casos de teste de relevância (contrato)
- **Description**: A correção só é aceita com testes automatizados dos fluxos que hoje falham.
- **Acceptance Criteria**:
  - Suite cobre: corpus de FR-2, pares “assunto A não vira B”, FR-3 (empate), FR-4 (fora do catálogo), FR-5 (troca no meio), FR-6 (não grudar)
  - Pelo menos os pares negativos: Wi-Fi ≠ Gov.br; PIX ≠ boleto; WhatsApp ≠ golpe; boleto ≠ PIX quando a mensagem é só sobre 2ª via
  - Testes de inferência **não** dependem de chamada real ao LLM (policy/retriever isolados)
  - Pelo menos 1 teste de integração do gerador de resposta garantindo que o prompt **não** contém passos do tópico errado
- **Priority**: Must

---

## Non-Functional Requirements

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| Inferência de tópico (sem LLM) | p95 | < 50ms em memória / query local |
| Chat completo (já existente) | p95 ponta a ponta | < 8s (sem regressão vs. `001`) |
| Esclarecimento (FR-3) | Chamadas LLM extra | 0 para só perguntar o tópico (mensagem template ou LLM curto; não buscar RAG) |

### Security / Guardrails
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Guardrails | FR-5 de `001-digital-guidance` | Valem para RAG **e** conhecimento geral |
| Fora do catálogo | Sem passos oficiais inventados como se fossem da base | Prompt deixa explícito o modo “orientação geral” |
| Logs | Sem PII / senha | Igual ao padrão do projeto |

### Reliability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Fallback se inferência falhar | UX | Perguntar de novo (FR-3); nunca injetar tópico aleatório |
| Falha do LLM | UX | Mensagem amigável já existente; não vazar contexto errado |

### Usability
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Linguagem | Vocabulário simples | Esclarecimentos e respostas gerais no mesmo tom do app |
| Analfabetos digitais | Erros de escrita | Corpus + normalização; não exigir grafia correta |

---

## Constraints

### Technical Constraints

**Project-wide standards**: Flutter + NestJS + Firebase + Postgres (ver `memory-bank/standards/`).

**Intent-specific constraints**:
- Não adicionar tópicos novos ao catálogo MVP (continuam os 6)
- Não exigir embeddings/vector DB neste intent (matching lexical + aliases + distância de edição). Embeddings ficam como Won't, reavaliar só se o corpus falhar nos testes com usuários
- Não mudar a UI do chat além do **texto** das respostas (sem tela nova de “escolha o tópico”, salvo o que a própria IA perguntar)
- Reusar ports `KnowledgeRetriever` / `TopicInferencePolicy` — evoluir, não criar stack paralelo
- Conhecimento geral (FR-4) usa o mesmo provedor LLM já configurado (Gemini)

### Business Constraints
- Público: analfabetos digitais; priorizar reconhecimento de intenção sobre precisão ortográfica
- Conteúdo curado continua sendo a fonte da verdade **quando** o tópico for um dos 6
- Prazo: correção de qualidade; escopo curto (1 unit / 1–2 bolts)

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| Aliases + fuzzy cobrem a maioria dos erros reais | Usuário ainda cai no tópico errado | Corpus expansível; FR-3 pergunta de novo |
| “Sim/não” quase nunca é mudança de assunto | Troca indevida de tópico | Exceção explícita para checkpoints (FR-5) |
| Conhecimento geral fora do catálogo é aceitável | Alucinação em tema sensível (banco, gov) | Guardrails + linguagem simples; não fingir base oficial |
| 2 esclarecimentos bastam | Loop cansativo ou abandono | Depois disso, FR-4 (orientação geral) |

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| Embeddings nesta correção? | Produto/Tech | 2026-09-15 | **Resolvido**: não; lexical + aliases + fuzzy |
| Fora do catálogo: recusar ou LLM geral? | Produto | 2026-09-15 | **Resolvido**: conhecimento geral da IA |
| Na dúvida: chutar ou perguntar? | Produto | 2026-09-15 | **Resolvido**: perguntar de novo para entender |
| Troca de tópico no meio da conversa? | Produto | 2026-09-15 | **Resolvido**: imediata |
| Limite de esclarecimentos? | Tech | 2026-09-15 | **Proposto**: 2 seguidas, depois FR-4 — validar no Checkpoint 2 |

---

## Out of Scope

- Novos tópicos além dos 6 do MVP
- Embeddings / pgvector / reindexação semântica
- CMS ou tela admin para editar aliases (seed/código nesta entrega)
- Mudança de layout do chat, atalhos da home ou voz (STT/TTS)
- Integração Gov.br / pedir credenciais
