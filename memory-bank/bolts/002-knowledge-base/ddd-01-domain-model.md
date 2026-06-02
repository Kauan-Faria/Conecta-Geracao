---
unit: 002-knowledge-base
bolt: 002-knowledge-base
stage: model
status: complete
created: 2026-06-01T12:00:00Z
---

# Static Model - Knowledge Base

## Bounded Context

**Knowledge Base** — contexto responsável por armazenar e expor conteúdo curado sobre tarefas digitais (tópicos, passos e checkpoints) para consumo pelo RAG do assistente de IA. Não orquestra LLM, não autentica usuários e não gerencia sessões de chat.

**Fronteiras**:
- **Dentro**: definição de tópicos, passos ordenados, checkpoints embutidos nos passos, seed MVP, persistência e leitura por slug/keywords.
- **Fora**: orquestração RAG (`003-ai-assistant-api`), UI mobile (`004-digital-guidance-ui`), autenticação Firebase.

---

## Domain Entities

| Entity | Properties | Business Rules |
|--------|------------|----------------|
| **KnowledgeTopic** | `id`, `slug`, `title`, `summary`, `keywords[]`, `displayOrder`, `isActive`, `createdAt`, `updatedAt` | `slug` único e imutável após criação; `title` e `summary` obrigatórios; `keywords` não vazio no MVP; `displayOrder` 1–6 no seed; conteúdo em português simples |
| **KnowledgeStep** | `id`, `topicId`, `order`, `instruction`, `checkpointQuestion?`, `checkpointHints?` | Pertence a exatamente um tópico; `order` inteiro ≥ 1 e único por tópico; `instruction` uma ação por passo; passos-chave do MVP devem ter `checkpointQuestion` |

---

## Value Objects

| Value Object | Properties | Constraints |
|--------------|------------|-------------|
| **TopicSlug** | `value: string` | kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`); 3–64 chars; imutável; slugs MVP fixos (ver tabela abaixo) |
| **StepOrder** | `value: number` | inteiro positivo; sequência contígua 1..n por tópico |
| **Keyword** | `value: string` | min 2 chars; lowercase normalizado para busca |
| **InstructionText** | `value: string` | max 500 chars; sem pedido de senha/token/credencial; frases curtas |
| **Checkpoint** | `question: string`, `hints?: string[]` | `question` obrigatório quando presente; usado pela IA para diagnóstico por etapas (FR-2); `hints` opcional para contexto RAG (ex.: "sim", "não", "ainda não abri") |

---

## Aggregates

| Aggregate Root | Members | Invariants |
|----------------|---------|------------|
| **KnowledgeTopic** | `KnowledgeStep` (coleção ordenada) | Slug único no agregado repositório; passos ordenados sem buracos (`1,2,3…`); seed MVP: ≥ 3 passos por tópico; ≥ 1 passo com checkpoint em tópicos com fluxo interativo; tópico `codigo-govbr` não pode conter instruções de login/credencial Gov.br real |

---

## Tópicos MVP (Ubiquitous Language + Slugs)

| # | Slug | Título (exemplo) | Foco |
|---|------|------------------|------|
| 1 | `fazer-pix` | Como fazer um PIX | Transferência no app do banco |
| 2 | `codigo-govbr` | Código Gov.br (tutorial) | Educativo; sem integração de login |
| 3 | `whatsapp-contato-localizacao` | WhatsApp: contato e localização | Compartilhar contato ou localização |
| 4 | `wifi-qr-code` | Senha do Wi-Fi via QR Code | Gerar/compartilhar QR no roteador/celular |
| 5 | `segunda-via-boleto` | 2ª via de boleto | Emitir segunda via em app/site oficial |
| 6 | `alerta-golpe` | Reconhecer possível golpe | Sinais de alerta; não clicar em links suspeitos |

---

## Domain Events

| Event | Trigger | Payload |
|-------|---------|---------|
| **KnowledgeTopicCreated** | Novo tópico persistido | `topicId`, `slug`, `occurredAt` |
| **KnowledgeBaseSeeded** | Seed MVP concluído com sucesso | `topicCount: 6`, `occurredAt` |
| **KnowledgeTopicUpdated** | Conteúdo de tópico alterado (futuro CMS) | `topicId`, `slug`, `occurredAt` |

*Nota MVP*: eventos podem ser log-only na infraestrutura; não exigem event bus no primeiro release.

---

## Domain Services

| Service | Operations | Dependencies |
|---------|------------|--------------|
| **KnowledgeContentPolicy** | `validateTopic(topic)`, `validateStep(step)` | Regras FR-5: rejeita instruções que peçam senha, OTP, PIN, token; rejeita menção a "digite sua senha no chat"; para `codigo-govbr` rejeita fluxos de autenticação real |
| **KnowledgeTopicFactory** | `createFromSeedData(dto)` | Monta agregado com passos ordenados e valida políticas antes de persistir |

---

## Repository Interfaces (Ports)

| Repository | Entity | Methods |
|------------|--------|---------|
| **KnowledgeTopicRepository** | `KnowledgeTopic` | `findBySlug(slug: TopicSlug): Promise<KnowledgeTopic \| null>`; `findAllActive(): Promise<KnowledgeTopic[]>`; `searchByKeywords(query: string): Promise<KnowledgeTopic[]>`; `save(topic: KnowledgeTopic): Promise<void>`; `existsBySlug(slug: TopicSlug): Promise<boolean>` |
| **KnowledgeStepRepository** *(opcional)* | `KnowledgeStep` | Pode ser encapsulado no repositório de tópico (load/save cascade); expor `findByTopicIdOrdered(topicId)` se separado |

**Contrato de leitura para RAG** (consumido no bolt `003-knowledge-base`):
- `getTopicWithStepsForRag(slug)` → tópico + passos como chunks estruturados (`order`, `instruction`, `checkpointQuestion`).

---

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **Tópico (Knowledge Topic)** | Assunto digital curado (ex.: PIX) identificado por slug |
| **Passo (Step)** | Instrução numerada que a IA entrega uma de cada vez |
| **Checkpoint** | Pergunta de confirmação antes do próximo passo ("Você já abriu o app do banco?") |
| **Slug** | Identificador estável na URL/API (`fazer-pix`) |
| **Seed** | Carga inicial dos 6 tópicos MVP no banco |
| **RAG chunk** | Representação estruturada de passo+tópico para recuperação pela IA |
| **Base de conhecimento** | Conjunto de tópicos ativos e seus passos |

---

## Stories Coverage

| Story | Cobertura no modelo |
|-------|---------------------|
| **001-topic-entity-schema** | Entidades `KnowledgeTopic`, `KnowledgeStep`; VOs `TopicSlug`, `StepOrder`, `Checkpoint`; agregado e port `KnowledgeTopicRepository` |
| **002-seed-six-mvp-topics** | Tabela de 6 slugs; invariantes ≥3 passos e checkpoints em passos-chave; `KnowledgeContentPolicy` para Gov.br e golpes |

---

## Diagrama (agregado)

```text
┌─────────────────────────────────────┐
│     KnowledgeTopic (root)           │
│  slug, title, summary, keywords     │
├─────────────────────────────────────┤
│  steps: KnowledgeStep[]             │
│    ├─ order, instruction            │
│    └─ checkpoint? (VO)              │
└─────────────────────────────────────┘
         │
         ▼
  KnowledgeTopicRepository (port)
```
