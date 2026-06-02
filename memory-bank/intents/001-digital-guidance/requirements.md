---
intent: 001-digital-guidance
phase: inception
status: requirements-approved
updated: 2026-05-28T01:00:00Z
---

# Requirements: Orientação digital guiada

## Intent Overview

Permitir que **analfabetos digitais** (20–70+ anos, smartphone próprio, uso majoritariamente solo) sanem dúvidas práticas do mundo digital **dentro do app**, por meio de um **assistente conversacional com IA** que pergunta em que etapa o usuário está e o orienta passo a passo. A IA consulta uma **base de conhecimento** curada com fluxos sobre tarefas digitais comuns. MVP enxuto para testes com usuários reais em ~3 meses.

**Fora de escopo no MVP**: perfis de cuidadores; integração real com Gov.br para autenticação; pedir senhas, tokens ou credenciais.

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Usuário resolve dúvida digital com orientação da IA | % de sessões que atingem checkpoint final do fluxo (meta a calibrar nos testes) | Must |
| Conversa clara e objetiva para execução da tarefa | Feedback qualitativo positivo em testes com usuários reais | Must |
| Cobertura dos fluxos críticos do MVP | 6 tópicos disponíveis na base de conhecimento e acionáveis via chat | Must |
| Experiência acessível | Conformidade com `ux-guide.md` (WCAG 2.1 AA + reforços) | Must |
| MVP entregável em ~3 meses | Testes com usuários reais iniciados no prazo | Must |

---

## Functional Requirements

### FR-1: Chat com assistente IA
- **Description**: O usuário inicia uma conversa no app e descreve sua dúvida em linguagem natural. A IA responde de forma conversacional, como um orientador humano.
- **Acceptance Criteria**:
  - Usuário pode enviar mensagem de texto e receber resposta da IA
  - Respostas em português, vocabulário simples e frases curtas
  - Uma mensagem da IA contém no máximo uma instrução principal por vez (passo a passo)
  - Histórico da conversa atual visível na tela de chat
- **Priority**: Must

### FR-2: Diagnóstico por etapas (checkpoints)
- **Description**: A IA pergunta em que ponto o usuário está (ex.: "Você já abriu o app do banco?") antes de avançar, confirmando se conseguiu executar cada etapa.
- **Acceptance Criteria**:
  - IA faz perguntas de checkpoint antes de instruir o próximo passo
  - Usuário pode responder sim/não ou descrever onde parou
  - IA adapta a resposta com base na resposta do usuário (não avança cegamente)
  - Fluxo registra etapa atual da sessão (para retomada e métricas)
- **Priority**: Must

### FR-3: Base de conhecimento para orientação
- **Description**: Conteúdo curado sobre tarefas digitais é armazenado e consultado pela IA para gerar respostas consistentes e corretas.
- **Acceptance Criteria**:
  - Base contém, no mínimo, os 6 tópicos do MVP (ver FR-4)
  - Cada tópico possui passos estruturados (etapas/checkpoints) consumíveis pela IA
  - Respostas da IA derivam da base (RAG ou equivalente), não apenas conhecimento livre do modelo
  - Conteúdo pode ser atualizado sem redeploy completo do app (via API/admin mínimo ou arquivos na API)
- **Priority**: Must

### FR-4: Tópicos cobertos no MVP
- **Description**: A base de conhecimento e a IA devem orientar sobre os seguintes assuntos:
  1. Como fazer um PIX
  2. Como obter/usar código Gov.br (tutorial informativo — **sem** integração de login)
  3. Como compartilhar contato ou localização pelo WhatsApp
  4. Como passar senha do Wi-Fi via QR Code
  5. Como emitir 2ª via de boleto
  6. Como reconhecer/aviso sobre possível golpe
- **Acceptance Criteria**:
  - Usuário consegue iniciar conversa sobre qualquer um dos 6 tópicos
  - IA conduz do início ao fim (ou até ponto seguro de parada) para cada tópico
  - Conteúdo Gov.br é exclusivamente educativo (não coleta credenciais nem autentica)
- **Priority**: Must

### FR-5: Guardrails de segurança e privacidade na conversa
- **Description**: A IA nunca solicita dados sensíveis proibidos e recusa pedidos perigosos.
- **Acceptance Criteria**:
  - IA **não** pede senha, token, OTP, PIN, credenciais bancárias ou dados equivalentes
  - IA orienta o usuário a inserir dados sensíveis **apenas** no app/sistema oficial, nunca no chat
  - Respostas sobre golpes incluem alerta claro sem induzir cliques em links desconhecidos
  - Logs e persistência seguem LGPD (sem armazenar dados sensíveis digitados pelo usuário)
- **Priority**: Must

### FR-6: Histórico de conversas
- **Description**: O usuário pode ver conversas anteriores para retomar contexto.
- **Acceptance Criteria**:
  - Lista de conversas passadas acessível no app
  - Usuário pode abrir conversa anterior e continuar (online)
  - Metadados mínimos: data, tópico inferido ou título, status (em andamento/concluída)
- **Priority**: Should

### FR-7: Acesso offline parcial
- **Description**: Sem internet, o usuário acessa conversas antigas previamente carregadas.
- **Acceptance Criteria**:
  - Modo offline exibe conversas já sincronizadas/cacheadas
  - Novas mensagens à IA **não** funcionam offline (mensagem clara ao usuário)
  - Limite de contexto renderizado respeitado (conversas muito longas podem truncar ou paginar)
- **Priority**: Should

### FR-8: Autenticação de usuário (pré-requisito)
- **Description**: Usuário autenticado (Firebase) para associar conversas e preferências; sem perfil de cuidador.
- **Acceptance Criteria**:
  - Login via Firebase (padrão do projeto)
  - Conversas vinculadas ao `firebase_uid`
  - Não existe fluxo de "cuidador" ou "conta vinculada"
- **Priority**: Must

### FR-9: Preferências de acessibilidade
- **Description**: Usuário ajusta fonte, contraste e densidade; chat respeita preferências.
- **Acceptance Criteria**:
  - Tamanho de fonte (normal/grande/extra grande) aplicado na UI do chat
  - Modo alto contraste disponível
  - Alvos de toque ≥ 48dp nos controles do chat
- **Priority**: Must

### FR-10: Entrada assistida por sugestões (opcional MVP)
- **Description**: Atalhos visuais para os 6 tópicos principais, reduzindo barreira de "o que perguntar".
- **Acceptance Criteria**:
  - Tela inicial ou chat exibe botões/cards com os tópicos do MVP
  - Toque em tópico inicia conversa com contexto pré-definido
- **Priority**: Could

---

## Non-Functional Requirements

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| Tempo de resposta da IA | p95 latência ponta a ponta | < 8s no MVP (ajustável) |
| Carregamento da lista de conversas | p95 | < 2s |
| Renderização de histórico longo | UX | Paginação ou truncamento sem travar UI |

### Scalability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Usuários simultâneos (MVP) | Sessões ativas | ~100 (fase de testes) |
| Tópicos na base | Registros | 6+ com expansão futura |

### Security
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Autenticação | Firebase Auth + guard NestJS | Padrão do projeto |
| Dados em trânsito | HTTPS | Obrigatório |
| LGPD | Consentimento + minimização | Sem PII/sensível desnecessário em logs |
| Guardrails IA | Política no prompt + validação | Bloquear pedidos de credenciais |
| Base de conhecimento | Acesso restrito à API | Sem exposição pública não autenticada |

### Reliability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Disponibilidade API (MVP) | Uptime | Best effort Render; degradação graciosa no app |
| Falha do provedor IA | UX | Mensagem amigável + retry; não perder mensagem do usuário |

### Usability / Accessibility
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Linguagem | Vocabulário simples | Frases curtas; evitar jargão |
| WCAG | 2.1 AA + reforços idosos | Ver `ux-guide.md` |
| Feedback de progresso | Checkpoints | Usuário sabe se "conseguiu" ou "travou" |

### Compliance
| Requirement | Standard | Notes |
|-------------|----------|-------|
| LGPD | Lei 13.709/2018 | Base legal, retenção mínima, direito de exclusão (fase MVP: documentar) |

---

## Constraints

### Technical Constraints

**Project-wide standards**: Flutter + NestJS + Firebase + Postgres/Supabase (ver `memory-bank/standards/`).

**Intent-specific constraints**:
- MVP enxuto — prazo ~3 meses para início dos testes
- Gov.br: **somente tutorial**; sem OAuth/integração Gov.br
- IA conversacional é **core** do MVP (não placeholder)
- Provedor de LLM e estratégia RAG a definir na Construction (OpenAI, Gemini, etc.)
- Offline limitado a histórico cacheado; chat ao vivo exige conexão
- Sem perfil de cuidador

### Business Constraints
- Público: analfabetos digitais 20–70+, smartphone próprio, uso solo
- Prioridade: MVP **utilizável** e conversacional, não feature-complete
- Custo de IA é secundário frente à entrega de valor percebido

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| RAG com base curada produz respostas confiáveis | Alucinações ou passos errados | Revisão humana do conteúdo; testes com usuários reais |
| 6 tópicos cobrem dúvidas iniciais do MVP | Baixa adoção | Expandir base após feedback dos testes |
| Usuários conseguem digitar ou usar sugestões | Barreira de entrada | FR-10 atalhos por tópico |
| Latência < 8s é aceitável para o público | Frustração | Indicador "pensando..."; otimizar prompts/RAG |

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| Provedor de LLM (OpenAI, Gemini, outro)? | Tech | Construction | Pendente |
| Admin de conteúdo: JSON estático vs. painel mínimo? | Tech/Produto | Units | Pendente |
| Retenção de conversas (dias/meses) sob LGPD? | Produto/Legal | Antes dos testes | Pendente |
| Entrada por voz no MVP? | Produto | Pendente | Provável Won't no MVP |

---

## Out of Scope (MVP)

- Perfil ou fluxo de cuidador/familiar
- Integração Gov.br para autenticação
- Pedido ou armazenamento de senhas, tokens, OTP
- CMS completo ou marketplace de tutoriais
- Chat offline com IA (apenas leitura de histórico)
- Entrada por voz (unless promoted later)
